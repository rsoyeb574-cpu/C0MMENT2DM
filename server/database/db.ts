import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';

/**
 * Strips password and sensitive auth credentials from database connection string.
 * Used strictly for safe logging and status reporting.
 * NEVER returns or logs raw credentials.
 */
export function sanitizeDatabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname;
    const port = parsed.port ? `:${parsed.port}` : '';
    const database = parsed.pathname.replace(/^\//, '');
    const user = parsed.username ? '***' : '';
    return `postgresql://${user ? user + ':***@' : ''}${host}${port}/${database}?sslmode=require`;
  } catch {
    return 'postgresql://***:***@hidden-host/database';
  }
}

/**
 * Extracts only host and database name for telemetry / safe status reporting.
 */
export function getSafeDatabaseMeta(): {
  configured: boolean;
  host: string;
  database: string;
  ssl: boolean;
} {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return {
      configured: false,
      host: 'none (demo memory mode)',
      database: 'none',
      ssl: false,
    };
  }

  try {
    const parsed = new URL(url);
    return {
      configured: true,
      host: parsed.hostname || 'unknown-host',
      database: parsed.pathname.replace(/^\//, '') || 'defaultdb',
      ssl: url.includes('sslmode=require') || url.includes('ssl=true') || true,
    };
  } catch {
    return {
      configured: true,
      host: 'configured-masked',
      database: 'configured-masked',
      ssl: true,
    };
  }
}

let poolInstance: Pool | null = null;

/**
 * Checks if DATABASE_URL environment variable is provided.
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

/**
 * Creates or retrieves the singleton connection pool optimized for Vercel Serverless.
 * - Max connections kept small (1-10) to respect serverless connection limits.
 * - Idle timeouts tuned for quick recycling.
 * - SSL configured with rejectUnauthorized: false to support Neon SNI & managed certs.
 */
export function getPool(): Pool | null {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (poolInstance) {
    return poolInstance;
  }

  const rawUrl = process.env.DATABASE_URL!;

  // Serverless pool configuration
  const poolConfig: PoolConfig = {
    connectionString: rawUrl,
    max: parseInt(process.env.PG_POOL_MAX || '10', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: {
      rejectUnauthorized: false,
    },
  };

  try {
    poolInstance = new Pool(poolConfig);

    poolInstance.on('error', (err) => {
      // Safe error log without connection string or password
      console.error('[PostgreSQL Pool Error]', err.message);
    });

    const meta = getSafeDatabaseMeta();
    console.log(`[PostgreSQL] Connection pool initialized for host: ${meta.host} (SSL active)`);
    return poolInstance;
  } catch (err: any) {
    console.error('[PostgreSQL Init Error]', err?.message || 'Failed to initialize pool');
    return null;
  }
}

/**
 * Safe query executor.
 * If DATABASE_URL is not configured, returns null without throwing.
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T> | null> {
  const pool = getPool();
  if (!pool) {
    return null;
  }

  try {
    const res = await pool.query<T>(text, params);
    return res;
  } catch (err: any) {
    // Sanitize any error output to prevent credential leaking
    const safeMessage = err.message ? err.message.replace(/postgres:\/\/[^@]+@/, 'postgres://***@') : 'Query error';
    console.error('[PostgreSQL Query Error]', safeMessage);
    throw new Error(safeMessage);
  }
}

/**
 * Tests database connectivity and measures round-trip latency.
 */
export async function testConnection(): Promise<{
  connected: boolean;
  latencyMs?: number;
  host: string;
  database: string;
  error?: string;
}> {
  const meta = getSafeDatabaseMeta();

  if (!isDatabaseConfigured()) {
    return {
      connected: false,
      host: meta.host,
      database: meta.database,
      error: 'DATABASE_URL environment variable is not set. Running in Demo Mode.',
    };
  }

  const start = Date.now();
  try {
    const res = await query('SELECT 1 as ping');
    const latencyMs = Date.now() - start;

    if (res && res.rows.length > 0) {
      return {
        connected: true,
        latencyMs,
        host: meta.host,
        database: meta.database,
      };
    }

    return {
      connected: false,
      host: meta.host,
      database: meta.database,
      error: 'Empty response received from database',
    };
  } catch (err: any) {
    return {
      connected: false,
      host: meta.host,
      database: meta.database,
      error: err.message || 'Connection test failed',
    };
  }
}

/**
 * Verifies which tables exist in PostgreSQL.
 */
export async function getExistingTables(): Promise<string[]> {
  try {
    const res = await query<{ table_name: string }>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    if (!res) return [];
    return res.rows.map((r) => r.table_name);
  } catch {
    return [];
  }
}

/**
 * Closes the pool cleanly (useful for migration CLI runner or shutdown).
 */
export async function closePool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}
