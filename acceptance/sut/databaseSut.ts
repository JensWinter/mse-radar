import postgres from 'postgres';
import { runMigrations } from '../../deno_scripts/db/migrate.ts';
import { seedDoraCapabilities } from '../../deno_scripts/db/seed_dora_capabilities.ts';

const RESET_SCRIPT = `
  DELETE FROM survey_responses;
  DELETE FROM survey_runs;
  DELETE FROM team_memberships;
  DELETE FROM teams;
  DELETE FROM users;
`;

interface TestDbContext {
  databaseUrl: string;
  dbName: string;
}

export class TestDatabase {
  private context: TestDbContext | null = null;
  private setupInProgress = false;

  async setUp(): Promise<string> {
    if (this.context || this.setupInProgress) {
      throw new Error('Test database already set up. Call tearDown() first.');
    }

    this.setupInProgress = true;

    const databaseUrl = getDatabaseUrlOrExit();
    const dbName = generateTestDbName();

    try {
      await createDatabase(databaseUrl, dbName);

      const testDatabaseUrl = buildTestUrl(databaseUrl, dbName);

      await runMigrations(testDatabaseUrl, './db/migrations');
      await seedDoraCapabilities(testDatabaseUrl);

      this.context = { databaseUrl: testDatabaseUrl, dbName };
      return testDatabaseUrl;
    } catch (error) {
      await dropDatabase(databaseUrl, dbName).catch(() => {});
      throw error;
    } finally {
      this.setupInProgress = false;
    }
  }

  async tearDown(): Promise<void> {
    if (!this.context) return;

    const databaseUrl = getDatabaseUrlOrExit();
    await dropDatabase(databaseUrl, this.context.dbName).catch(() => {});
    this.context = null;
  }

  async resetData(): Promise<void> {
    if (!this.context) {
      throw new Error('Test database not set up. Call setUp() first.');
    }

    const sql = postgres(this.context.databaseUrl);
    try {
      await sql.unsafe(RESET_SCRIPT);
    } finally {
      await sql.end();
    }
  }

  static connectToExisting(databaseUrl: string): TestDatabase {
    const instance = new TestDatabase();
    const url = new URL(databaseUrl);
    instance.context = { databaseUrl, dbName: url.pathname.slice(1) };
    return instance;
  }
}

function getDatabaseUrlOrExit(): string {
  const databaseUrl = Deno.env.get('DATABASE_URL');
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set.');
    Deno.exit(1);
  }

  return databaseUrl;
}

function generateTestDbName(): string {
  const uuid = crypto.randomUUID().replace(/-/g, '').substring(0, 12);
  return `test_${uuid}`;
}

function buildTestUrl(baseUrl: string, dbName: string): string {
  const url = new URL(baseUrl);
  url.pathname = `/${dbName}`;
  return url.toString();
}

async function createDatabase(baseUrl: string, dbName: string): Promise<void> {
  const sql = postgres(baseUrl);
  try {
    await sql.unsafe(`CREATE DATABASE "${dbName}"`);
  } finally {
    await sql.end();
  }
}

async function dropDatabase(baseUrl: string, dbName: string): Promise<void> {
  const sql = postgres(baseUrl);
  try {
    await sql.unsafe(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${dbName}' AND pid <> pg_backend_pid()
    `);
    await sql.unsafe(`DROP DATABASE IF EXISTS "${dbName}"`);
  } finally {
    await sql.end();
  }
}
