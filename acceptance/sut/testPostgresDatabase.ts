import pg from 'pg';

const { Client } = pg;

export interface TestDbContext {
  databaseUrl: string;
  cleanup: () => Promise<void>;
}

export interface TestPostgresDatabaseConfig {
  migrate: (databaseUrl: string) => Promise<unknown>;
  seed?: (databaseUrl: string) => Promise<void>;
  resetScript: string;
}

export class TestPostgresDatabase {
  private context: TestDbContext | null = null;
  private setupInProgress = false;

  constructor(private readonly config: TestPostgresDatabaseConfig) {}

  getDatabaseUrl(): string {
    if (!this.context) {
      throw new Error('Test database not set up. Call setUp() or setExistingContext() first.');
    }
    return this.context.databaseUrl;
  }

  protected setExistingContext(databaseUrl: string): void {
    this.context = { databaseUrl, cleanup: () => Promise.resolve() };
  }

  async setUp(): Promise<string> {
    if (this.context || this.setupInProgress) {
      throw new Error('Test database already set up. Call tearDown() first.');
    }

    this.setupInProgress = true;

    const dbName = this.generateTestDbName();

    try {
      await this.createDatabase(dbName);
      const databaseUrl = this.buildDatabaseUrl(dbName);
      await this.config.migrate(databaseUrl);
      if (this.config.seed) {
        await this.config.seed(databaseUrl);
      }

      this.context = {
        databaseUrl,
        cleanup: async () => {
          await this.dropDatabase(dbName);
        },
      };

      return databaseUrl;
    } catch (error) {
      try {
        await this.dropDatabase(dbName);
      } catch {
        // ignore cleanup errors
      }
      throw error;
    } finally {
      this.setupInProgress = false;
    }
  }

  async tearDown(): Promise<void> {
    if (this.context) {
      await this.context.cleanup();
      this.context = null;
    }
  }

  async resetData(): Promise<void> {
    if (!this.context) {
      throw new Error('Test database not set up. Call setUp() first.');
    }

    const client = new Client({ connectionString: this.context.databaseUrl });
    await client.connect();

    try {
      await client.query(this.config.resetScript);
    } finally {
      await client.end();
    }
  }

  private getAdminDatabaseUrl(): string {
    return Deno.env.get('DATABASE_URL') ||
      'postgresql://mse_radar:mse_radar@localhost:5432/mse_radar';
  }

  private buildDatabaseUrl(dbName: string): string {
    const adminUrl = this.getAdminDatabaseUrl();
    const url = new URL(adminUrl);
    url.pathname = `/${dbName}`;
    return url.toString();
  }

  private async createDatabase(dbName: string): Promise<void> {
    const client = new Client({ connectionString: this.getAdminDatabaseUrl() });
    await client.connect();
    try {
      await client.query(`CREATE DATABASE "${dbName}"`);
    } finally {
      await client.end();
    }
  }

  private async dropDatabase(dbName: string): Promise<void> {
    const client = new Client({ connectionString: this.getAdminDatabaseUrl() });
    await client.connect();
    try {
      // Terminate existing connections
      await client.query(
        `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
        [dbName],
      );
      await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    } finally {
      await client.end();
    }
  }

  private generateTestDbName(): string {
    const uuid = crypto.randomUUID().replace(/-/g, '').substring(0, 12);
    return `test_${uuid}`;
  }
}
