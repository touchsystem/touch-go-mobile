/**
 * Banco de dados local (SQLite) para transações offline e backup.
 * Persiste pedidos e fechamentos de mesa para envio posterior ao backend.
 * Usa fallback em memória quando expo-sqlite não está disponível (Expo Go, web).
 */

import { Platform } from 'react-native';

export type TransactionType = 'order' | 'close_mesa';

export interface PendingTransactionRow {
  id: number;
  type: TransactionType;
  payload: string;
  created_at: number;
  synced_at: number | null;
  last_error: string | null;
  retry_count: number;
}

// --- Implementação em memória (fallback para Expo Go / web) ---

interface MemoryRow {
  id: number;
  type: TransactionType;
  payload: string;
  created_at: number;
  synced_at: number | null;
  last_error: string | null;
  retry_count: number;
}

let memoryStore: MemoryRow[] = [];
let nextId = 1;

async function insertPendingMemory(type: TransactionType, payload: object): Promise<number> {
  const id = nextId++;
  const row: MemoryRow = {
    id,
    type,
    payload: JSON.stringify(payload),
    created_at: Date.now(),
    synced_at: null,
    last_error: null,
    retry_count: 0,
  };
  memoryStore.push(row);
  console.log(`[LocalDB] Inserida transação local (memória) id=${id} type=${type}`);
  return id;
}

async function markSyncedMemory(id: number): Promise<void> {
  const row = memoryStore.find((r) => r.id === id);
  if (row) {
    row.synced_at = Date.now();
    row.last_error = null;
    console.log(`[LocalDB] Transação id=${id} marcada como sincronizada`);
  }
}

async function markSyncErrorMemory(id: number, errorMessage: string): Promise<void> {
  const row = memoryStore.find((r) => r.id === id);
  if (row) {
    row.last_error = errorMessage.substring(0, 500);
    row.retry_count += 1;
  }
}

async function getPendingTransactionsMemory(): Promise<PendingTransactionRow[]> {
  return memoryStore
    .filter((r) => r.synced_at === null)
    .sort((a, b) => a.created_at - b.created_at)
    .map((r) => ({
      id: r.id,
      type: r.type,
      payload: r.payload,
      created_at: r.created_at,
      synced_at: r.synced_at,
      last_error: r.last_error,
      retry_count: r.retry_count,
    }));
}

async function pruneSyncedOlderThanDaysMemory(days: number = 7): Promise<void> {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const before = memoryStore.length;
  memoryStore = memoryStore.filter((r) => r.synced_at === null || (r.synced_at !== null && r.synced_at >= cutoff));
  const removed = before - memoryStore.length;
  if (removed > 0) {
    console.log(`[LocalDB] Removidas ${removed} transações antigas (backup)`);
  }
}

// --- Implementação SQLite (quando disponível) ---

type Backend = 'sqlite' | 'memory';
let backend: Backend | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqliteDb: any = null;

async function initSqlite(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const SQLite = await import('expo-sqlite');
    const db = await SQLite.openDatabaseAsync('eatzgo_local.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pending_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        synced_at INTEGER,
        last_error TEXT,
        retry_count INTEGER DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_pending_synced ON pending_transactions(synced_at);
      CREATE INDEX IF NOT EXISTS idx_pending_type ON pending_transactions(type);
    `);
    backend = 'sqlite';
    sqliteDb = db;
    return true;
  } catch (e) {
    const msg = String(e);
    if (
      msg.includes('ExpoSQLite') ||
      msg.includes('native module') ||
      msg.includes('expo-sqlite') ||
      msg.includes('Cannot find')
    ) {
      console.warn('[LocalDB] expo-sqlite indisponível (Expo Go/web?), usando memória');
      return false;
    }
    throw e;
  }
}

async function ensureBackend(): Promise<Backend> {
  if (backend) return backend;
  const ok = await initSqlite();
  backend = ok ? 'sqlite' : 'memory';
  return backend;
}

/**
 * Salva uma transação localmente (sempre). Retorna o id local.
 */
export async function insertPending(type: TransactionType, payload: object): Promise<number> {
  const b = await ensureBackend();
  if (b === 'memory') return insertPendingMemory(type, payload);
  const db = sqliteDb!;
  const now = Date.now();
  const result = await db.runAsync(
    'INSERT INTO pending_transactions (type, payload, created_at, retry_count) VALUES (?, ?, ?, 0)',
    [type, JSON.stringify(payload), now]
  );
  const id = typeof result.lastInsertRowId === 'number' ? result.lastInsertRowId : Number(result.lastInsertRowId);
  console.log(`[LocalDB] Inserida transação local id=${id} type=${type}`);
  return id;
}

/**
 * Marca transação como sincronizada (sucesso no backend).
 */
export async function markSynced(id: number): Promise<void> {
  const b = await ensureBackend();
  if (b === 'memory') return markSyncedMemory(id);
  const db = sqliteDb!;
  const now = Date.now();
  await db.runAsync(
    'UPDATE pending_transactions SET synced_at = ?, last_error = NULL WHERE id = ?',
    [now, id]
  );
  console.log(`[LocalDB] Transação id=${id} marcada como sincronizada`);
}

/**
 * Registra falha de sync para retry posterior.
 */
export async function markSyncError(id: number, errorMessage: string): Promise<void> {
  const b = await ensureBackend();
  if (b === 'memory') return markSyncErrorMemory(id, errorMessage);
  const db = sqliteDb!;
  await db.runAsync(
    'UPDATE pending_transactions SET last_error = ?, retry_count = retry_count + 1 WHERE id = ?',
    [errorMessage.substring(0, 500), id]
  );
}

/**
 * Lista transações pendentes (não sincronizadas), ordenadas por created_at.
 */
export async function getPendingTransactions(): Promise<PendingTransactionRow[]> {
  const b = await ensureBackend();
  if (b === 'memory') return getPendingTransactionsMemory();
  const db = sqliteDb!;
  return db.getAllAsync(
    'SELECT id, type, payload, created_at, synced_at, last_error, retry_count FROM pending_transactions WHERE synced_at IS NULL ORDER BY created_at ASC'
  ) as Promise<PendingTransactionRow[]>;
}

/**
 * Remove transações já sincronizadas há mais de 7 dias (limpeza).
 */
export async function pruneSyncedOlderThanDays(days: number = 7): Promise<void> {
  const b = await ensureBackend();
  if (b === 'memory') return pruneSyncedOlderThanDaysMemory(days);
  const db = sqliteDb!;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const result = await db.runAsync(
    'DELETE FROM pending_transactions WHERE synced_at IS NOT NULL AND synced_at < ?',
    [cutoff]
  );
  if (result.changes > 0) {
    console.log(`[LocalDB] Removidas ${result.changes} transações antigas (backup)`);
  }
}

/**
 * Inicialização (opcional). Chamar no startup do app.
 */
export async function initLocalDb(): Promise<void> {
  try {
    await ensureBackend();
    console.log(`[LocalDB] Banco local inicializado (${backend})`);
  } catch (e) {
    console.warn('[LocalDB] Falha ao inicializar banco local:', e);
    backend = 'memory';
  }
}
