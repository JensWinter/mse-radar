import { type BindValue, Database } from '@db/sqlite';

/**
 * SQLite database connection wrapper providing a consistent interface.
 */
export class SqlConnection {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Execute a query and return rows as objects.
   */
  queryObject<T>(sql: string, params: BindValue[] = []): { rows: T[] } {
    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as T[];
    return { rows };
  }

  /**
   * Execute a statement without returning results.
   */
  execute(sql: string, params: BindValue[] = []): void {
    const stmt = this.db.prepare(sql);
    stmt.run(...params);
  }

  /**
   * Execute multiple SQL statements (for migrations).
   */
  executeScript(sql: string): void {
    this.db.exec(sql);
  }

  /**
   * Close the database connection.
   */
  end(): void {
    this.db.close();
  }
}

/**
 * Creates a connection to a SQLite database.
 * @param dbPath Path to the database file. For tests, this will be a unique file path.
 */
export function createConnection(dbPath: string): SqlConnection {
  const db = new Database(dbPath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  return new SqlConnection(db);
}

/**
 * Gets the database path from environment or uses default.
 */
export function getDatabasePath(): string {
  return Deno.env.get('AUTH_DB_PATH') || './data/auth.db';
}
