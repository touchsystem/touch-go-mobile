/**
 * Banco de dados local (SQLite) para transações offline e backup.
 * Persiste pedidos e fechamentos de mesa para envio posterior ao backend.
 */

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'eatzgo_local.db';

export type TransactionType = 'order' | 'close_mesa';

export interface PendingTransactionRow {
  id: number;
  type: TransactionType;
  payload: string; // JSON
  created_at: number;
  synced_at: number | null;
  last_error: string | null;
  retry_count: number;
}

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
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
  return db;
}

/**
 * Salva uma transação localmente (sempre). Retorna o id local.
 */
export async function insertPending(
  type: TransactionType,
  payload: object
): Promise<number> {
  const database = await getDb();
  const now = Date.now();
  const result = await database.runAsync(
    'INSERT INTO pending_transactions (type, payload, created_at, retry_count) VALUES (?, ?, ?, 0)',
    [type, JSON.stringify(payload), now]
  );
  const id = result.lastInsertRowId;
  console.log(`[LocalDB] Inserida transação local id=${id} type=${type}`);
  return typeof id === 'number' ? id : Number(id);
}

/**
 * Marca transação como sincronizada (sucesso no backend).
 */
export async function markSynced(id: number): Promise<void> {
  const database = await getDb();
  const now = Date.now();
  await database.runAsync(
    'UPDATE pending_transactions SET synced_at = ?, last_error = NULL WHERE id = ?',
    [now, id]
  );
  console.log(`[LocalDB] Transação id=${id} marcada como sincronizada`);
}

/**
 * Registra falha de sync para retry posterior.
 */
export async function markSyncError(id: number, errorMessage: string): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    'UPDATE pending_transactions SET last_error = ?, retry_count = retry_count + 1 WHERE id = ?',
    [errorMessage.substring(0, 500), id]
  );
}

/**
 * Lista transações pendentes (não sincronizadas), ordenadas por created_at.
 */
export async function getPendingTransactions(): Promise<PendingTransactionRow[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<PendingTransactionRow>(
    'SELECT id, type, payload, created_at, synced_at, last_error, retry_count FROM pending_transactions WHERE synced_at IS NULL ORDER BY created_at ASC'
  );
  return rows;
}

/**
 * Remove transações já sincronizadas há mais de 7 dias (limpeza).
 */
export async function pruneSyncedOlderThanDays(days: number = 7): Promise<void> {
  const database = await getDb();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const result = await database.runAsync(
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
    await getDb();
    console.log('[LocalDB] Banco local inicializado');
  } catch (e) {
    console.warn('[LocalDB] Falha ao inicializar banco local:', e);
  }
}
