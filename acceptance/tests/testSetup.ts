import { afterAll, afterEach, beforeAll, beforeEach } from '@std/testing/bdd';
import { TestDatabase } from '../sut/databaseSut.ts';
import { AstroSutHandle, ensureAstroSutRunning } from '../sut/astroSut.ts';
import { Dsl } from '../dsl/Dsl.ts';
import { AuthTestDatabase } from '../sut/authDatabaseSut.ts';

const isManagedMode = Deno.env.get('ACCEPTANCE_SUT_MANAGED') === 'true';

/**
 * Sets up the acceptance test infrastructure for a test suite.
 *
 * This function must be called at the top level of each test file (not inside describe blocks)
 * to properly register the beforeAll/afterAll/beforeEach/afterEach hooks.
 *
 * @returns The DSL instance to use in tests
 *
 * @example
 * ```typescript
 * import { describe, it } from '@std/testing/bdd';
 * import { setupAcceptanceTest } from './testSetup.ts';
 *
 * const dsl = setupAcceptanceTest();
 *
 * describe('My Test Suite', () => {
 *   it('should do something', async () => {
 *     await dsl.identityAndAccess.registerUser();
 *   });
 * });
 * ```
 */
export function setupAcceptanceTest(): Dsl {
  const dsl = new Dsl();

  if (isManagedMode) {
    return setupManagedMode(dsl);
  }
  return setupStandaloneMode(dsl);
}

function setupManagedMode(dsl: Dsl): Dsl {
  const baseUrl = Deno.env.get('ACCEPTANCE_SUT_BASE_URL')!;
  const surveyDbPath = Deno.env.get('SURVEY_DB_PATH')!;
  const authDbPath = Deno.env.get('AUTH_DB_PATH')!;

  const databaseSut = TestDatabase.connectToExisting(surveyDbPath);
  const authDatabaseSut = AuthTestDatabase.connectToExisting(authDbPath);
  const astroSut: AstroSutHandle = {
    baseUrl,
    ownsProcess: false,
    dbPath: surveyDbPath,
    authDbPath,
    stop: () => Promise.resolve(),
  };

  beforeAll(async () => {
    await dsl.setUpBrowser();
  });

  afterAll(async () => {
    await dsl.tearDownBrowser();
  });

  beforeEach(async () => {
    databaseSut.resetData();
    authDatabaseSut.resetData();
    await dsl.setUp(astroSut);
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
    const dbPath = await databaseSut.setUp();
    const authDbPath = await authDatabaseSut.setUp();
    astroSut = await ensureAstroSutRunning(dbPath, authDbPath);
    await dsl.setUpBrowser();
  });

  afterAll(async () => {
    await dsl.tearDownBrowser();
    await astroSut.stop();
    await databaseSut.tearDown();
    await authDatabaseSut.tearDown();
  });

  beforeEach(async () => {
    databaseSut.resetData();
    authDatabaseSut.resetData();
    await dsl.setUp(astroSut);
  });

  afterEach(async () => {
    await dsl.tearDown();
  });

  return dsl;
}
