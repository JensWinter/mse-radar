import { runMigrations } from '../../deno_scripts/db/migrate.ts';
import { seedDoraCapabilities } from '../../deno_scripts/db/seed_dora_capabilities.ts';
import { TestPostgresDatabase } from './testPostgresDatabase.ts';

export class TestDatabase extends TestPostgresDatabase {
  constructor() {
    super({
      migrate: runMigrations,
      seed: seedDoraCapabilities,
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

  static connectToExisting(databaseUrl: string): TestDatabase {
    const instance = new TestDatabase();
    instance.setExistingContext(databaseUrl);
    return instance;
  }
}
