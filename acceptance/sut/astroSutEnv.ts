export type AstroSutEnvOptions = {
  protocol?: string;
  host?: string;
  port?: number;
};

function readTrimmedEnv(name: string): string | undefined {
  const value = Deno.env.get(name)?.trim();
  return value ? value : undefined;
}

function readNumberEnv(name: string): number | undefined {
  const raw = readTrimmedEnv(name);
  if (!raw) return undefined;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Default port for acceptance tests.
 * Uses 4322 to avoid conflicts with the development server (4321).
 * This ensures tests always run against a test-owned server with the correct schema.
 */
export const DEFAULT_TEST_PORT = 4322;

/**
 * Reads Astro SUT connection details from env vars used by acceptance tests.
 *
 * Supported variables:
 * - ASTRO_WEB_PROTOCOL
 * - ASTRO_WEB_HOST
 * - ASTRO_WEB_PORT (defaults to 4322 to avoid conflicts with dev server on 4321)
 */
export function getAstroSutOptionsFromEnv(): AstroSutEnvOptions {
  return {
    protocol: readTrimmedEnv('ASTRO_WEB_PROTOCOL'),
    host: readTrimmedEnv('ASTRO_WEB_HOST'),
    port: readNumberEnv('ASTRO_WEB_PORT') ?? DEFAULT_TEST_PORT,
  };
}
