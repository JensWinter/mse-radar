import { createConnection, getDatabaseUrl, type SqlConnection } from './connection.ts';

const MIGRATIONS_TABLE = '_migrations_auth';

interface Migration {
  id: string;
  name: string;
  sql: string;
}

async function ensureMigrationsTable(client: SqlConnection): Promise<void> {
  await client.executeScript(`
    CREATE TABLE IF NOT EXISTS "${MIGRATIONS_TABLE}" (
      id text PRIMARY KEY,
      name text NOT NULL,
      applied_at timestamptz DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(client: SqlConnection): Promise<Set<string>> {
  const result = await client.queryObject<{ id: string }>(`
    SELECT id FROM "${MIGRATIONS_TABLE}"
  `);
  return new Set(result.rows.map((row) => row.id));
}

async function recordMigration(client: SqlConnection, migration: Migration): Promise<void> {
  await client.execute(
    `INSERT INTO "${MIGRATIONS_TABLE}" (id, name) VALUES ($1, $2)`,
    [migration.id, migration.name],
  );
}

async function loadMigrations(migrationsDir: string): Promise<Migration[]> {
  const migrations: Migration[] = [];

  for await (const entry of Deno.readDir(migrationsDir)) {
    if (entry.isFile && entry.name.endsWith('.sql')) {
      const filePath = `${migrationsDir}/${entry.name}`;
      const content = await Deno.readTextFile(filePath);

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

export async function runMigrations(
  databaseUrl: string,
): Promise<{ applied: string[]; skipped: string[] }> {
  const client = await createConnection(databaseUrl);

  try {
    await ensureMigrationsTable(client);

    const migrations = await loadMigrations('./db/migrations_better-auth');

    const appliedMigrations = await getAppliedMigrations(client);

    const applied: string[] = [];
    const skipped: string[] = [];

    for (const migration of migrations) {
      if (appliedMigrations.has(migration.id)) {
        skipped.push(`${migration.id}_${migration.name}`);
        continue;
      }

      try {
        await client.executeScript('BEGIN');
        await client.executeScript(migration.sql);
        await recordMigration(client, migration);
        await client.executeScript('COMMIT');
      } catch (error) {
        await client.executeScript('ROLLBACK');
        throw new Error(`Migration ${migration.id}_${migration.name} failed: ${error}`);
      }

      applied.push(`${migration.id}_${migration.name}`);
    }

    return { applied, skipped };
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  const databaseUrl = Deno.args[0] || getDatabaseUrl();

  console.log(`Running migrations on database: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`);

  try {
    const result = await runMigrations(databaseUrl);

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

if (import.meta.main) {
  await main();
}
