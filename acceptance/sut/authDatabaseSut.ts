import { runMigrations as runAuthMigrations } from '../../deno_scripts/db_better-auth/migrate.ts';
import { TestPostgresDatabase } from './testPostgresDatabase.ts';

export class AuthTestDatabase extends TestPostgresDatabase {
  constructor() {
    super({
      migrate: runAuthMigrations,
      resetScript: `
        BEGIN;
        DELETE FROM auth_verification;
        DELETE FROM auth_account;
        DELETE FROM auth_session;
        DELETE FROM auth_user;
        COMMIT;
      `,
    });
  }

  async runMigrations(): Promise<void> {
    const databaseUrl = this.getDatabaseUrl();
    await runAuthMigrations(databaseUrl);
  }

  static connectToExisting(databaseUrl: string): AuthTestDatabase {
    const instance = new AuthTestDatabase();
    instance.setExistingContext(databaseUrl);
    return instance;
  }
}
