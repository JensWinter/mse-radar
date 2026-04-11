import postgres from 'postgres';
import { runMigrations } from '../../deno_scripts/db/migrate.ts';

const RESET_SCRIPT = `
  DELETE FROM auth_verification;
  DELETE FROM auth_account;
  DELETE FROM auth_session;
  DELETE FROM auth_user;
`;

export class AuthTestDatabase {
  private databaseUrl: string | null = null;

  async runMigrations(databaseUrl: string): Promise<void> {
    this.databaseUrl = databaseUrl;
    await runMigrations(databaseUrl, './db/migrations_better-auth', '_migrations_auth');
  }

  async resetData(): Promise<void> {
    if (!this.databaseUrl) {
      throw new Error('Auth database not set up. Call runMigrations() first.');
    }

    const sql = postgres(this.databaseUrl);
    try {
      await sql.unsafe(RESET_SCRIPT);
    } finally {
      await sql.end();
    }
  }

  static connectToExisting(databaseUrl: string): AuthTestDatabase {
    const instance = new AuthTestDatabase();
    instance.databaseUrl = databaseUrl;
    return instance;
  }
}
