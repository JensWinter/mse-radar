import pg from 'pg';
import { DATABASE_URL } from 'astro:env/server';

const { Pool } = pg;

let pool: pg.Pool | undefined;

function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({ connectionString: DATABASE_URL });
  }
  return pool;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<{ rows: T[] }> {
  const result = await getPool().query<T>(text, values);
  return { rows: result.rows };
}

export async function execute(
  text: string,
  values: unknown[] = [],
): Promise<{ rowCount: number }> {
  const result = await getPool().query(text, values);
  return { rowCount: result.rowCount ?? 0 };
}

export async function transaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
