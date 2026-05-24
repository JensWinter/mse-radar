import { runMigrations } from '../../deno_scripts/db/migrate.ts';

export class AuthTestDatabase {
  private databaseUrl: string | null = null;

  async runMigrations(databaseUrl: string): Promise<void> {
    this.databaseUrl = databaseUrl;
    await runMigrations(databaseUrl, './db/migrations_better-auth', '_migrations_auth');
  }
}
