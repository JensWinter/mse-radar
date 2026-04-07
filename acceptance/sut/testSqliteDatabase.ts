import * as path from '@std/path';

export interface TestDbContext {
  dbPath: string;
  cleanup: () => Promise<void>;
}

interface DbClient {
  executeScript(sql: string): void;
  end(): void;
}

export interface TestSqliteDatabaseConfig {
  migrate: (dbPath: string) => Promise<unknown>;
  seed?: (dbPath: string) => void;
  createConnection: (dbPath: string) => DbClient;
  resetScript: string;
}

export class TestSqliteDatabase {
  private context: TestDbContext | null = null;
  private setupInProgress = false;

  constructor(private readonly config: TestSqliteDatabaseConfig) {}

  protected setExistingContext(dbPath: string): void {
    this.context = { dbPath, cleanup: () => Promise.resolve() };
  }

  async setUp(): Promise<string> {
    if (this.context || this.setupInProgress) {
      throw new Error('Test database already set up. Call tearDown() first.');
    }

    this.setupInProgress = true;

    const dbPath = this.generateTestDbPath();

    try {
      await this.ensureTestDbDirectory();
      await this.config.migrate(dbPath);
      this.config.seed?.(dbPath);

      this.context = {
        dbPath,
        cleanup: async () => {
          await this.cleanupTestDatabase(dbPath);
        },
      };

      return dbPath;
    } catch (error) {
      await this.cleanupTestDatabase(dbPath);
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

  resetData(): void {
    if (!this.context) {
      throw new Error('Test database not set up. Call setUp() first.');
    }

    const client = this.config.createConnection(this.context.dbPath);

    try {
      client.executeScript(this.config.resetScript);
    } finally {
      client.end();
    }
  }

  private getTestDbDirectory(): string {
    return path.join(Deno.cwd(), 'db', 'test-databases');
  }

  private async ensureTestDbDirectory(): Promise<void> {
    try {
      await Deno.mkdir(this.getTestDbDirectory(), { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        throw error;
      }
    }
  }

  private async cleanupTestDatabase(dbPath: string): Promise<void> {
    const testDbDir = this.getTestDbDirectory();
    if (!dbPath.startsWith(`${testDbDir}/test_`) || !dbPath.endsWith('.db')) {
      throw new Error(`Invalid test database path: ${dbPath}`);
    }

    for (const file of [dbPath, `${dbPath}-wal`, `${dbPath}-shm`]) {
      try {
        await Deno.remove(file);
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
      }
    }
  }

  private generateTestDbPath(): string {
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '');
    const uuid = crypto.randomUUID().replace(/-/g, '').substring(0, 12);
    return `${this.getTestDbDirectory()}/test_${timestamp}_${uuid}.db`;
  }
}
