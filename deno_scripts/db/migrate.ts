import { createConnection, getDatabaseUrlOrExit, type Sql } from './connection.ts';

interface Migration {
  id: string;
  name: string;
  sql: string;
}

async function ensureMigrationsTable(sql: Sql, table: string): Promise<void> {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "${table}" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(sql: Sql, table: string): Promise<Set<string>> {
  const rows = await sql.unsafe<{ id: string }[]>(`SELECT id FROM "${table}"`);
  return new Set(rows.map((row) => row.id));
}

async function loadMigrations(migrationsDir: string): Promise<Migration[]> {
  const migrations: Migration[] = [];

  for await (const entry of Deno.readDir(migrationsDir)) {
    if (entry.isFile && entry.name.endsWith('.sql')) {
      const filePath = `${migrationsDir}/${entry.name}`;
      const content = await Deno.readTextFile(filePath);

      const match = entry.name.match(/^(\d+)_(.+)\.sql$/);
      if (match) {
        migrations.push({ id: match[1], name: match[2], sql: content });
      }
    }
  }

  return migrations.sort((a, b) => a.id.localeCompare(b.id));
}

export async function runMigrations(
  databaseUrl: string,
  migrationsDir: string,
  migrationsTable = '_migrations',
): Promise<{ applied: string[]; skipped: string[] }> {
  const sql = createConnection(databaseUrl);

  try {
    await ensureMigrationsTable(sql, migrationsTable);

    const migrations = await loadMigrations(migrationsDir);
    const appliedMigrations = await getAppliedMigrations(sql, migrationsTable);

    const applied: string[] = [];
    const skipped: string[] = [];

    for (const migration of migrations) {
      if (appliedMigrations.has(migration.id)) {
        skipped.push(`${migration.id}_${migration.name}`);
        continue;
      }

      // PostgreSQL supports transactional DDL — wrap migration + tracking in one transaction
      await sql.begin(async (tx) => {
        await tx.unsafe(migration.sql);
        await tx.unsafe(
          `INSERT INTO "${migrationsTable}" (id, name) VALUES ($1, $2)`,
          [migration.id, migration.name],
        );
      });

      applied.push(`${migration.id}_${migration.name}`);
    }

    return { applied, skipped };
  } finally {
    await sql.end();
  }
}

async function main(): Promise<void> {
  const databaseUrl = getDatabaseUrlOrExit();

  console.log('Running main database migrations');

  try {
    const result = await runMigrations(databaseUrl, './db/migrations');

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
