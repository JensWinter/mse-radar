import { TestDatabase } from './sut/databaseSut.ts';
import { AuthTestDatabase } from './sut/authDatabaseSut.ts';
import { ensureAstroSutRunning } from './sut/astroSut.ts';
import * as path from '@std/path';

async function cleanupStaleTestDatabases(testDbDir: string) {
  try {
    for await (const entry of Deno.readDir(testDbDir)) {
      if (entry.isFile && entry.name.startsWith('test_') && entry.name.endsWith('.db')) {
        const filePath = path.join(testDbDir, entry.name);
        for (const suffix of ['', '-wal', '-shm']) {
          try {
            await Deno.remove(filePath + suffix);
          } catch (e) {
            if (!(e instanceof Deno.errors.NotFound)) throw e;
          }
        }
      }
    }
  } catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) throw e;
  }
}

async function main() {
  const testDbDir = path.join(Deno.cwd(), 'db', 'test-databases');
  await cleanupStaleTestDatabases(testDbDir);

  const databaseSut = new TestDatabase();
  const authDatabaseSut = new AuthTestDatabase();

  const dbPath = await databaseSut.setUp();
  const authDbPath = await authDatabaseSut.setUp();

  console.log(`[batch] Survey DB: ${dbPath}`);
  console.log(`[batch] Auth DB:   ${authDbPath}`);

  const astroSut = await ensureAstroSutRunning(dbPath, authDbPath);
  console.log(`[batch] Astro SUT running at ${astroSut.baseUrl}`);

  try {
    const denoCmd = Deno.build.os === 'windows' ? 'deno.exe' : 'deno';
    const command = new Deno.Command(denoCmd, {
      args: [
        'test',
        '--permit-no-files',
        '--allow-all',
        '--junit-path=./acceptance-tests-report.xml',
        'acceptance/tests/*.spec.ts',
      ],
      stdin: 'inherit',
      stdout: 'inherit',
      stderr: 'inherit',
      env: {
        ...Deno.env.toObject(),
        ACCEPTANCE_SUT_MANAGED: 'true',
        ACCEPTANCE_SUT_BASE_URL: astroSut.baseUrl,
        SURVEY_DB_PATH: dbPath,
        AUTH_DB_PATH: authDbPath,
      },
    });

    const child = command.spawn();
    const status = await child.status;
    Deno.exitCode = status.code;
  } finally {
    console.log('[batch] Stopping Astro SUT...');
    await astroSut.stop();
    await databaseSut.tearDown();
    await authDatabaseSut.tearDown();
    console.log('[batch] Cleanup complete.');
  }
}

await main();
