import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  isDatabaseConfigured,
  getSafeDatabaseMeta,
  getPool,
  query,
  getExistingTables,
  closePool,
} from './db.js';

const REQUIRED_TABLES = [
  'users',
  'sessions',
  'instagram_accounts',
  'campaigns',
  'keywords',
  'message_templates',
  'comment_events',
  'dm_events',
  'link_clicks',
  'usage_records',
  'leads',
];

export interface MigrationResult {
  success: boolean;
  message: string;
  database: string;
  host: string;
  migratedTables: string[];
  missingTables: string[];
  durationMs: number;
}

/**
 * Runs the schema migration against PostgreSQL.
 * Safe for serverless and CLI execution.
 */
export async function runMigration(): Promise<MigrationResult> {
  const startTime = Date.now();
  const meta = getSafeDatabaseMeta();

  if (!isDatabaseConfigured()) {
    return {
      success: false,
      message:
        'DATABASE_URL environment variable is not defined. Please configure DATABASE_URL (e.g. Neon PostgreSQL with ?sslmode=require) before running migrations.',
      database: meta.database,
      host: meta.host,
      migratedTables: [],
      missingTables: REQUIRED_TABLES,
      durationMs: Date.now() - startTime,
    };
  }

  try {
    // Locate schema.sql file
    let schemaPath = path.resolve(process.cwd(), 'server/database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      // Fallback for ESM resolution
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      schemaPath = path.resolve(__dirname, 'schema.sql');
    }

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log(`[Migration] Connecting to PostgreSQL at ${meta.host}...`);

    // Execute full DDL script
    await query(schemaSql);

    // Verify existing tables
    const existing = await getExistingTables();
    const migratedTables = REQUIRED_TABLES.filter((t) => existing.includes(t));
    const missingTables = REQUIRED_TABLES.filter((t) => !existing.includes(t));

    const success = missingTables.length === 0;
    const durationMs = Date.now() - startTime;

    return {
      success,
      message: success
        ? `Successfully migrated all ${migratedTables.length} tables to PostgreSQL (${durationMs}ms)`
        : `Migration partially applied. Missing tables: ${missingTables.join(', ')}`,
      database: meta.database,
      host: meta.host,
      migratedTables,
      missingTables,
      durationMs,
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    console.error('[Migration Error]', err.message);
    return {
      success: false,
      message: `Migration failed: ${err.message}`,
      database: meta.database,
      host: meta.host,
      migratedTables: [],
      missingTables: REQUIRED_TABLES,
      durationMs,
    };
  }
}

// CLI Runner execution
const isDirectExecution =
  process.argv[1] &&
  (process.argv[1].endsWith('migrate.ts') || process.argv[1].endsWith('migrate.js'));

if (isDirectExecution) {
  console.log('====================================================');
  console.log(' Comment2DM PostgreSQL Schema Migration Runner');
  console.log('====================================================');

  runMigration()
    .then((result) => {
      console.log(`\nTarget Host: ${result.host}`);
      console.log(`Database:    ${result.database}`);
      console.log(`Status:      ${result.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`Duration:    ${result.durationMs}ms`);
      console.log(`\nVerified Tables (${result.migratedTables.length}/${REQUIRED_TABLES.length}):`);
      for (const table of result.migratedTables) {
        console.log(`  ✓ ${table}`);
      }
      if (result.missingTables.length > 0) {
        console.log('\nMissing Tables:');
        for (const table of result.missingTables) {
          console.log(`  ✗ ${table}`);
        }
      }
      console.log(`\nMessage: ${result.message}\n`);
      return closePool().then(() => {
        process.exit(result.success ? 0 : 1);
      });
    })
    .catch((err) => {
      console.error('\nFatal error during migration:', err?.message || err);
      process.exit(1);
    });
}
