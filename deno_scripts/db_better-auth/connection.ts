import pg from 'pg';

const { Client } = pg;

export class SqlConnection {
  private readonly client: pg.Client;

  constructor(client: pg.Client) {
    this.client = client;
  }

  async queryObject<T>(sql: string, params: unknown[] = []): Promise<{ rows: T[] }> {
    const result = await this.client.query<T>(sql, params);
    return { rows: result.rows };
  }

  async execute(sql: string, params: unknown[] = []): Promise<void> {
    await this.client.query(sql, params);
  }

  async executeScript(sql: string): Promise<void> {
    await this.client.query(sql);
  }

  async end(): Promise<void> {
    await this.client.end();
  }
}

export async function createConnection(databaseUrl: string): Promise<SqlConnection> {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  return new SqlConnection(client);
}

export function getDatabaseUrl(): string {
  return Deno.env.get('DATABASE_URL') ||
    'postgresql://mse_radar:mse_radar@localhost:5432/mse_radar';
}
