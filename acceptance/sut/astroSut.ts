import { DEFAULT_TEST_PORT, getAstroSutOptionsFromEnv } from './astroSutEnv.ts';

export type AstroSutHandle = {
  baseUrl: string;
  /** true if this module started the process and should stop it */
  readonly ownsProcess: boolean;
  readonly dbPath: string;
  readonly authDbPath: string;
  stop: () => Promise<void>;
};

let sharedHandle: AstroSutHandle | undefined;

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function isHttpReachable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'GET' });
    await response.body?.cancel();
    return response.ok || (response.status >= 300 && response.status < 500);
  } catch {
    return false;
  }
}

async function waitUntilReachable(url: string, timeoutMs: number) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isHttpReachable(url)) return;
    await sleep(500);
  }

  throw new Error(
    `Astro SUT not reachable at ${url} after ${timeoutMs}ms. ` +
      `Either start it manually or check that the port is free and the app can start.`,
  );
}

function tryReuseHandle(dbPath: string, authDbPath: string): AstroSutHandle | undefined {
  if (!sharedHandle) return undefined;
  if (sharedHandle.dbPath !== dbPath || sharedHandle.authDbPath !== authDbPath) {
    throw new Error(
      `Database path mismatch: the shared Astro SUT was started with different database paths.\n` +
        `  Expected dbPath:     ${sharedHandle.dbPath}\n` +
        `  Requested dbPath:    ${dbPath}\n` +
        `  Expected authDbPath: ${sharedHandle.authDbPath}\n` +
        `  Requested authDbPath: ${authDbPath}\n\n` +
        `All test files sharing a server instance must use the same database paths.`,
    );
  }
  return sharedHandle;
}

/**
 * Ensures the Astro app (SUT) is running.
 *
 * This function always starts a new test-owned server process.
 * It does not reuse external servers to prevent database mismatch issues
 * (external servers may be connected to a different database file).
 *
 * The test server runs on port 4322 by default (configurable via ASTRO_WEB_PORT)
 * to avoid conflicts with the development server on port 4321.
 */
export async function ensureAstroSutRunning(
  dbPath: string,
  authDbPath: string,
): Promise<AstroSutHandle> {
  const existingHandle = tryReuseHandle(dbPath, authDbPath);
  if (existingHandle) return existingHandle;

  const options = getAstroSutOptionsFromEnv();

  const protocol = options.protocol ?? 'http';
  const host = options.host ?? '127.0.0.1';
  const port = options.port ?? DEFAULT_TEST_PORT;
  const baseUrl = `${protocol}://${host}:${port}`;

  // Refuse to reuse external servers to prevent schema mismatch issues.
  // External servers may be connected to a different database schema,
  // causing flaky tests when the test expects a fresh schema.
  if (await isHttpReachable(baseUrl)) {
    throw new Error(
      `An external server is already running at ${baseUrl}.\n` +
        `Acceptance tests require a dedicated test server to ensure correct database schema.\n\n` +
        `Please either:\n` +
        `  1. Stop the external server on port ${port}, or\n` +
        `  2. Set ASTRO_WEB_PORT to a different port for tests\n\n` +
        `Note: The development server typically runs on port 4321.\n` +
        `      Tests use port ${DEFAULT_TEST_PORT} by default to avoid conflicts.`,
    );
  }

  const denoCmd = Deno.build.os === 'windows' ? 'deno.exe' : 'deno';
  const command = new Deno.Command(denoCmd, {
    cwd: new URL('../../', import.meta.url),
    args: ['task', 'run:astro:preview', '--port', String(port), '--host', host],
    stdin: 'null',
    stdout: 'null',
    stderr: 'null',
    env: {
      ...Deno.env.toObject(),
      SURVEY_DB_PATH: dbPath,
      AUTH_DB_PATH: authDbPath,
      NODE_ENV: 'acceptance',
    },
  });

  const child = command.spawn();
  const sutUrl = `${baseUrl}/`;

  try {
    await waitUntilReachable(sutUrl, 30_000);
  } catch (e) {
    try {
      child.kill('SIGTERM');
    } catch {
      // ignore
    }

    throw e;
  }

  const ownsProcess = true;
  sharedHandle = {
    baseUrl,
    ownsProcess,
    dbPath,
    authDbPath,
    stop: async () => {
      if (!ownsProcess) return;
      try {
        child.kill('SIGTERM');
      } catch {
        // ignore
      }

      await child.status.catch(() => undefined);
      sharedHandle = undefined;
    },
  };

  return sharedHandle;
}
