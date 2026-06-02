import { After, AfterAll, Before, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { Dsl } from '../../dsl/Dsl.ts';
import { TestDatabase } from '../../sut/databaseSut.ts';
import { AuthTestDatabase } from '../../sut/authDatabaseSut.ts';
import { AstroSutHandle, ensureAstroSutRunning } from '../../sut/astroSut.ts';

/**
 * Sets up the four-layer SUT for the Gherkin suite via Cucumber.js hooks.
 *
 * Browser + SUT are shared per worker process; each scenario gets a fresh
 * browser context and a unique token (mirroring the legacy `deno test
 * --parallel` model). In managed mode the SUT is started once by
 * runAllFeatures.ts and passed in via env; in standalone mode each worker
 * starts its own database + Astro server.
 */

const isManagedMode = Deno.env.get('ACCEPTANCE_SUT_MANAGED') === 'true';

// Per-worker shared state.
const dsl = new Dsl();
let sut: AstroSutHandle;
let scenarioToken = '';

// Standalone-mode resources (undefined in managed mode).
let databaseSut: TestDatabase | undefined;

// Steps fail fast against the SUT (DSL sets a 2s Playwright timeout); keep a
// little headroom for multi-action steps. Hook timeout is generous to allow a
// cold Astro build in standalone mode.
setDefaultTimeout(15_000);

function generateTestToken(): string {
  return crypto.randomUUID().replaceAll('-', '');
}

export function getSharedDsl(): Dsl {
  return dsl;
}

export function getScenarioToken(): string {
  return scenarioToken;
}

BeforeAll({ timeout: 180_000 }, async () => {
  if (isManagedMode) {
    const baseUrl = Deno.env.get('ACCEPTANCE_SUT_BASE_URL')!;
    const databaseUrl = Deno.env.get('DATABASE_URL')!;
    sut = {
      baseUrl,
      ownsProcess: false,
      databaseUrl,
      stop: () => Promise.resolve(),
    };
  } else {
    databaseSut = new TestDatabase();
    const authDatabaseSut = new AuthTestDatabase();
    const databaseUrl = await databaseSut.setUp();
    await authDatabaseSut.runMigrations(databaseUrl);
    sut = await ensureAstroSutRunning(databaseUrl);
  }

  await dsl.setUpBrowser();
});

AfterAll(async () => {
  await dsl.tearDownBrowser();
  if (!isManagedMode) {
    await sut?.stop();
    await databaseSut?.tearDown();
  }
});

Before(async () => {
  scenarioToken = generateTestToken();
  await dsl.setUp(sut, scenarioToken);
});

After(async () => {
  await dsl.tearDown();
});
