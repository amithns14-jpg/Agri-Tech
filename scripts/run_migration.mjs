// AgroGuide AI - Database Migration Runner
// Executes 001_initial_schema.sql against Supabase PostgreSQL

import fs from 'fs';
import path from 'path';

// Self-contained .env parser to avoid dependency issues
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const envObj = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      envObj[key] = val;
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
  return envObj;
}

loadEnvFile(path.resolve(process.cwd(), '.env'));
loadEnvFile(path.resolve(process.cwd(), 'server/.env'));

const projectRef = 'wuzruagtkiszfymytagx';
const poolerHost = 'aws-0-ap-northeast-1.pooler.supabase.com';
const supabaseUrl = process.env.SUPABASE_URL || `https://${projectRef}.supabase.co`;
const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL;

console.log('======================================================================');
console.log('🌾 AgroGuide AI: Supabase Database Migration Runner');
console.log('======================================================================');
console.log(`📡 Target Supabase URL: ${supabaseUrl}`);
console.log(`🆔 Project Reference:  ${projectRef}`);
console.log(`🌐 Supabase Pooler:    ${poolerHost}:6543`);

// Check for migration file
let migrationPath = path.resolve(process.cwd(), 'supabase/migrations/001_initial_schema.sql');
if (!fs.existsSync(migrationPath)) {
  migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20260213000001_initial_schema.sql');
}

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found at: ${migrationPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(migrationPath, 'utf8');
console.log(`📄 Migration file loaded: ${path.basename(migrationPath)} (${(sql.length / 1024).toFixed(1)} KB)`);

async function runMigration() {
  if (dbUrl) {
    console.log('\n🔗 Connecting to Supabase PostgreSQL database via connection string...');
    let Client;
    try {
      const pgModule = await import(path.resolve(process.cwd(), 'server/node_modules/pg/lib/index.js'));
      Client = pgModule.default?.Client || pgModule.Client;
    } catch (e) {
      console.error('Could not load pg client:', e.message);
      process.exit(1);
    }

    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('✅ Connected successfully to Supabase PostgreSQL database!');
      console.log('⏳ Executing 001_initial_schema.sql (11 tables, RLS policies, triggers)...');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');

      console.log('\n🎉 Migration completed successfully!');
      console.log('   All 11 tables, triggers, indexes, and RLS policies are now live in Supabase.');
      await client.end();
      process.exit(0);
    } catch (err) {
      console.error('❌ Migration execution error:', err.message);
      try { await client.query('ROLLBACK'); } catch {}
      await client.end();
      process.exit(1);
    }
  } else {
    console.log('\n----------------------------------------------------------------------');
    console.log('ℹ️  STATUS: DATABASE_URL is not set in server/.env');
    console.log('----------------------------------------------------------------------');
    console.log('To execute the SQL migration script against your Supabase project:');
    console.log('👉 Option 1 (One-Click in Supabase Studio - Fastest):');
    console.log(`1. Open: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    console.log('2. Paste the contents of supabase/migrations/001_initial_schema.sql');
    console.log('3. Click "Run". All 11 tables & RLS policies are created immediately.');
    console.log('\n👉 Option 2 (Direct Automated CLI Execution):');
    console.log('Add your Supabase database password to server/.env:');
    console.log(`DATABASE_URL="postgresql://postgres.${projectRef}:[YOUR-DB-PASSWORD]@${poolerHost}:6543/postgres"`);
    console.log('Then run: pnpm migrate\n');
    console.log('----------------------------------------------------------------------');
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('http')) {
      console.log('⚠️  Notice: In server/.env, SUPABASE_SERVICE_ROLE_KEY is not set to your secret service-role key.');
      console.log('   Replace it with your service_role secret key from Project Settings -> API.');
    } else {
      console.log('✅ SUPABASE_SERVICE_ROLE_KEY is configured with your secret API key.');
    }
  }
}

runMigration();
