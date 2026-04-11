import { TestDatabase } from './sut/databaseSut.ts';
import { AuthTestDatabase } from './sut/authDatabaseSut.ts';
import { ensureAstroSutRunning } from './sut/astroSut.ts';

async function main() {
  const databaseSut = new TestDatabase();
  const authDatabaseSut = new AuthTestDatabase();

  const databaseUrl = await databaseSut.setUp();
  await authDatabaseSut.runMigrations(databaseUrl);

  console.log(`[batch] Database URL: ${databaseUrl}`);

  const astroSut = await ensureAstroSutRunning(databaseUrl);
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
        DATABASE_URL: databaseUrl,
      },
    });

    const child = command.spawn();
    const status = await child.status;
    Deno.exitCode = status.code;
  } finally {
    console.log('[batch] Stopping Astro SUT...');
    await astroSut.stop();
    await databaseSut.tearDown();
    console.log('[batch] Cleanup complete.');
  }
}

await main();
