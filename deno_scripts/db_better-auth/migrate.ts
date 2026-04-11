import { runMigrations } from '../db/migrate.ts';
import { getDatabaseUrlOrExit } from '../db/connection.ts';

async function main(): Promise<void> {
  const databaseUrl = getDatabaseUrlOrExit();

  console.log('Running better-auth migrations');

  try {
    const result = await runMigrations(
      databaseUrl,
      './db/migrations_better-auth',
      '_migrations_auth',
    );

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
