import { afterAll, afterEach, beforeAll, beforeEach } from '@std/testing/bdd';
import { TestDatabase } from '../sut/databaseSut.ts';
import { AstroSutHandle, ensureAstroSutRunning } from '../sut/astroSut.ts';
import { Dsl } from '../dsl/Dsl.ts';
import { AuthTestDatabase } from '../sut/authDatabaseSut.ts';

const isManagedMode = Deno.env.get('ACCEPTANCE_SUT_MANAGED') === 'true';

function generateTestToken(): string {
  return crypto.randomUUID().replaceAll('-', '').slice(0, 8);
}

export function setupAcceptanceTest(): Dsl {
  const dsl = new Dsl();

  if (isManagedMode) {
    return setupManagedMode(dsl);
  }
  return setupStandaloneMode(dsl);
}

function setupManagedMode(dsl: Dsl): Dsl {
  const baseUrl = Deno.env.get('ACCEPTANCE_SUT_BASE_URL')!;
  const databaseUrl = Deno.env.get('DATABASE_URL')!;

  const astroSut: AstroSutHandle = {
    baseUrl,
    ownsProcess: false,
    databaseUrl,
    stop: () => Promise.resolve(),
  };

  beforeAll(async () => {
    await dsl.setUpBrowser();
  });

  afterAll(async () => {
    await dsl.tearDownBrowser();
  });

  beforeEach(async () => {
    await dsl.setUp(astroSut, generateTestToken());
  });

  afterEach(async () => {
    await dsl.tearDown();
  });

  return dsl;
}

function setupStandaloneMode(dsl: Dsl): Dsl {
  const databaseSut = new TestDatabase();
  const authDatabaseSut = new AuthTestDatabase();
  let astroSut: AstroSutHandle;

  beforeAll(async () => {
    const databaseUrl = await databaseSut.setUp();
    // Run auth migrations on the same test database
    await authDatabaseSut.runMigrations(databaseUrl);
    astroSut = await ensureAstroSutRunning(databaseUrl);
    await dsl.setUpBrowser();
  });

  afterAll(async () => {
    await dsl.tearDownBrowser();
    await astroSut.stop();
    await databaseSut.tearDown();
    // authDatabaseSut shares the same DB, no separate tearDown needed
  });

  beforeEach(async () => {
    await dsl.setUp(astroSut, generateTestToken());
  });

  afterEach(async () => {
    await dsl.tearDown();
  });

  return dsl;
}
