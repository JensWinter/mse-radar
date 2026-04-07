import { createConnection, getDatabasePath, type SqlConnection } from './connection.ts';

const MIGRATIONS_TABLE = '_migrations';

interface Migration {
  id: string;
  name: string;
  sql: string;
}

/**
 * Ensures the migrations tracking table exists.
 */
function ensureMigrationsTable(client: SqlConnection): void {
  client.executeScript(`
    CREATE TABLE IF NOT EXISTS "${MIGRATIONS_TABLE}" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

/**
 * Gets the list of already applied migrations.
 */
function getAppliedMigrations(client: SqlConnection): Set<string> {
  const result = client.queryObject<{ id: string }>(`
    SELECT id FROM "${MIGRATIONS_TABLE}"
  `);
  return new Set(result.rows.map((row) => row.id));
}

/**
 * Records a migration as applied.
 */
function recordMigration(client: SqlConnection, migration: Migration): void {
  client.execute(
    `INSERT INTO "${MIGRATIONS_TABLE}" (id, name) VALUES (?, ?)`,
    [migration.id, migration.name],
  );
}

/**
 * Loads all migration files from the migrations directory.
 */
async function loadMigrations(migrationsDir: string): Promise<Migration[]> {
  const migrations: Migration[] = [];

  for await (const entry of Deno.readDir(migrationsDir)) {
    if (entry.isFile && entry.name.endsWith('.sql')) {
      const filePath = `${migrationsDir}/${entry.name}`;
      const content = await Deno.readTextFile(filePath);

      // Extract ID from filename (e.g., "001_initial.sql" -> "001")
      const match = entry.name.match(/^(\d+)_(.+)\.sql$/);
      if (match) {
        migrations.push({
          id: match[1],
          name: match[2],
          sql: content,
        });
      }
    }
  }

  return migrations.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Ensures the database directory exists.
 */
async function ensureDatabaseDirectory(dbPath: string): Promise<void> {
  const dir = dbPath.substring(0, dbPath.lastIndexOf('/'));
  if (dir) {
    try {
      await Deno.mkdir(dir, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        throw error;
      }
    }
  }
}

/**
 * Runs all pending migrations.
 * @param dbPath Path to the SQLite database file
 */
export async function runMigrations(
  dbPath: string,
): Promise<{ applied: string[]; skipped: string[] }> {
  await ensureDatabaseDirectory(dbPath);

  const client = createConnection(dbPath);

  try {
    ensureMigrationsTable(client);

    const migrations = await loadMigrations('./db/migrations');

    const appliedMigrations = getAppliedMigrations(client);

    const applied: string[] = [];
    const skipped: string[] = [];

    for (const migration of migrations) {
      if (appliedMigrations.has(migration.id)) {
        skipped.push(`${migration.id}_${migration.name}`);
        continue;
      }

      // SQLite doesn't support transactional DDL,
      // but we can still use transactions for the migration tracking
      try {
        client.executeScript(migration.sql);
        recordMigration(client, migration);
      } catch (error) {
        throw new Error(`Migration ${migration.id}_${migration.name} failed: ${error}`);
      }

      applied.push(`${migration.id}_${migration.name}`);
    }

    return { applied, skipped };
  } finally {
    client.end();
  }
}

/**
 * CLI entry point for running migrations.
 */
async function main(): Promise<void> {
  const dbPath = Deno.args[0] || getDatabasePath();

  console.log(`Running migrations on database: ${dbPath}`);

  try {
    const result = await runMigrations(dbPath);

    if (result.applied.length > 0) {
      console.log(`\nApplied ${result.applied.length} migration(s):`);
      result.applied.forEach((m) => console.log(`  - ${m}`));
    } else {
      console.log('\nNo new migrations to apply.');
    }

    if (result.skipped.length > 0) {
      console.log(`\nSkipped ${result.skipped.length} already applied migration(s).`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    Deno.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  await main();
}
