import { runMigrations } from '../../deno_scripts/db/migrate.ts';
import { seedDoraCapabilities } from '../../deno_scripts/db/seed_dora_capabilities.ts';
import { createConnection } from '../../deno_scripts/db/connection.ts';
import { TestSqliteDatabase } from './testSqliteDatabase.ts';

export class TestDatabase extends TestSqliteDatabase {
  constructor() {
    super({
      migrate: runMigrations,
      seed: seedDoraCapabilities,
      createConnection,
      resetScript: `
        BEGIN;
        DELETE FROM survey_responses;
        DELETE FROM survey_runs;
        DELETE FROM team_memberships;
        DELETE FROM teams;
        DELETE FROM users;
        COMMIT;
      `,
    });
  }

  static connectToExisting(dbPath: string): TestDatabase {
    const instance = new TestDatabase();
    instance.setExistingContext(dbPath);
    return instance;
  }
}
