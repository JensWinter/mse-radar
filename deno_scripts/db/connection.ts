import postgres from 'postgres';

export type Sql = postgres.Sql;

export function createConnection(databaseUrl: string): Sql {
  return postgres(databaseUrl);
}

export function getDatabaseUrlOrExit(): string {
  const databaseUrl = Deno.env.get('DATABASE_URL');
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set.');
    Deno.exit(1);
  }

  return databaseUrl;
}
