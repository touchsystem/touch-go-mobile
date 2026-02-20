/**
 * Serviço de sincronização: grava transações localmente e envia ao backend.
 * - Sempre salva no banco local (backup + offline).
 * - Tenta enviar ao backend; se falhar por rede, mantém pendente e sincroniza depois.
 */

import api from './api';
import {
  insertPending,
  getPendingTransactions,
  markSynced,
  markSyncError,
  initLocalDb,
  pruneSyncedOlderThanDays,
  type TransactionType,
  type PendingTransactionRow,
} from './local-db';

export interface SubmitOrderPayload {
  cabecalho: {
    status_tp_venda: string;
    mesa: number;
    id_cliente: number | null;
    nome_cliente: string;
    cpf_cliente: string;
    celular: string;
    nick: string;
    obs: string;
  };
  itens: any[];
}

export interface CloseMesaPayload {
  id_mesa: number;
  taxa_servico: string;
  vendas: { id_venda: number; desconto: number }[];
  recebimentos: {
    id_tipo_rec: number;
    vl_principal: number;
    vl_extrangeiro: number;
  }[];
}

function isNetworkError(error: any): boolean {
  if (!error) return false;
  // Axios: sem response e com request = falha de rede/timeout
  if (error.request && !error.response) return true;
  const msg = (error.message || '').toLowerCase();
  return (
    msg.includes('network') ||
    msg.includes('conexão') ||
    msg.includes('conexao') ||
    msg.includes('timeout') ||
    msg.includes('econnrefused') ||
    msg.includes('enotfound')
  );
}

/**
 * Envia pedido: salva localmente e tenta backend. Se offline, fica pendente.
 * @returns { synced: true } se enviou ao backend; { synced: false, localId } se salvou só local.
 */
export async function submitOrder(payload: SubmitOrderPayload): Promise<{ synced: boolean; localId?: number }> {
  const localId = await insertPending('order', payload);
  try {
    await api.post('/vendas', payload);
    await markSynced(localId);
    return { synced: true };
  } catch (err: any) {
    if (isNetworkError(err)) {
      await markSyncError(localId, err?.message || 'Erro de conexão');
      return { synced: false, localId };
    }
    // Erro de negócio (ex.: validação) não marcar como pendente de sync; só rede.
    await markSyncError(localId, err?.response?.data?.erro || err?.message || 'Erro');
    throw err;
  }
}

/**
 * Fecha mesa no backend: salva localmente e tenta backend. Se offline, fica pendente.
 */
export async function closeMesa(payload: CloseMesaPayload): Promise<{ synced: boolean; localId?: number }> {
  const localId = await insertPending('close_mesa', payload);
  try {
    await api.post('/caixa/fechar-mesa', payload);
    await markSynced(localId);
    return { synced: true };
  } catch (err: any) {
    if (isNetworkError(err)) {
      await markSyncError(localId, err?.message || 'Erro de conexão');
      return { synced: false, localId };
    }
    await markSyncError(localId, err?.response?.data?.erro || err?.message || 'Erro');
    throw err;
  }
}

function applyPayload(row: PendingTransactionRow): Promise<void> {
  const payload = JSON.parse(row.payload);
  if (row.type === 'order') {
    return api.post('/vendas', payload).then(() => {});
  }
  if (row.type === 'close_mesa') {
    return api.post('/caixa/fechar-mesa', payload).then(() => {});
  }
  return Promise.resolve();
}

/**
 * Sincroniza todas as transações pendentes com o backend. Chamar no startup e quando voltar online.
 */
export async function syncPending(): Promise<{ synced: number; failed: number }> {
  await initLocalDb();
  const pending = await getPendingTransactions();
  let synced = 0;
  let failed = 0;
  for (const row of pending) {
    try {
      await applyPayload(row);
      await markSynced(row.id);
      synced++;
    } catch (err: any) {
      await markSyncError(row.id, err?.message || String(err));
      failed++;
      if (!isNetworkError(err)) {
        // Erro de negócio: não insistir nos próximos por enquanto
        break;
      }
    }
  }
  if (synced > 0 || pending.length > 0) {
    console.log(`[TransactionSync] Pendentes: ${pending.length}, sincronizadas: ${synced}, falhas: ${failed}`);
  }
  return { synced, failed };
}

/**
 * Inicializa o banco local e opcionalmente roda a primeira sincronização.
 */
export async function initTransactionSync(andSyncNow: boolean = true): Promise<void> {
  await initLocalDb();
  if (andSyncNow) {
    await syncPending();
  }
  await pruneSyncedOlderThanDays(7);
}
