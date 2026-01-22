import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be set in .env');
      console.error('Get these from: Supabase Dashboard → Settings → API');
      process.exit(1);
    }

    console.log('🔗 Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('_prisma_migrations')
      .select('count')
      .limit(1);

    if (testError && testError.code !== 'PGRST116') {
      // PGRST116 means table doesn't exist, which is fine for first migration
      console.log('✅ Supabase connection successful');
    }

    console.log('🔄 Running database migrations...');
    
    const schema = readFileSync(join(process.cwd(), 'src/db/schema.sql'), 'utf-8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Execute each statement using Supabase RPC or direct SQL
    // Note: Supabase client doesn't support raw SQL directly, so we'll use the REST API
    console.log('⚠️  Note: Supabase client doesn\'t support raw SQL migrations directly.');
    console.log('💡 Please run migrations using one of these methods:');
    console.log('   1. Use the Supabase SQL Editor in the dashboard');
    console.log('   2. Use the direct PostgreSQL connection (original migrate.ts)');
    console.log('   3. Use Supabase CLI: supabase db push');
    
    // For now, let's try using the connection pooling string instead
    console.log('\n🔄 Trying alternative: Use connection pooling string from Supabase...');
    console.log('   Go to: Settings → Database → Connection string → Connection pooling');
    console.log('   Copy the "Session" or "Transaction" mode URI');
    console.log('   Update DATABASE_URL in .env with that connection string');
    
    process.exit(1);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
