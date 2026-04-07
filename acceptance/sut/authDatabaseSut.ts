import { runMigrations } from '../../deno_scripts/db_better-auth/migrate.ts';
import { createConnection } from '../../deno_scripts/db_better-auth/connection.ts';
import { TestSqliteDatabase } from './testSqliteDatabase.ts';

export class AuthTestDatabase extends TestSqliteDatabase {
  constructor() {
    super({
      migrate: runMigrations,
      createConnection,
      resetScript: `
        BEGIN;
        DELETE FROM verification;
        DELETE FROM account;
        DELETE FROM session;
        DELETE FROM user;
        COMMIT;
      `,
    });
  }

  static connectToExisting(dbPath: string): AuthTestDatabase {
    const instance = new AuthTestDatabase();
    instance.setExistingContext(dbPath);
    return instance;
  }
}
