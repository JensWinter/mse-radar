import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { SURVEY_DB_PATH } from 'astro:env/server';

let db: DatabaseType | undefined;

function getDatabase(): DatabaseType {
  if (!db) {
    db = new Database(SURVEY_DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }

  return db;
}

/**
 * Execute a query and return rows.
 * @param text SQL query with ? placeholders
 * @param values Parameter values
 */
export function query<T = Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
): { rows: T[] } {
  const database = getDatabase();
  const stmt = database.prepare(text);
  const rows = stmt.all(...values) as T[];
  return { rows };
}

/**
 * Execute a statement that modifies data (INSERT, UPDATE, DELETE).
 * @param text SQL statement with ? placeholders
 * @param values Parameter values
 * @returns Object with changes count and lastInsertRowid
 */
export function execute(
  text: string,
  values: unknown[] = [],
): { changes: number; lastInsertRowid: number | bigint } {
  const database = getDatabase();
  const stmt = database.prepare(text);
  const result = stmt.run(...values);
  return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
}

/**
 * Run multiple statements in a transaction.
 * @param fn Function containing database operations
 */
export function transaction<T>(fn: () => T): T {
  const database = getDatabase();
  return database.transaction(fn)();
}
