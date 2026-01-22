import { readFileSync } from 'fs';
import { join } from 'path';
import { query, pool } from './db/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    // Validate DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in .env file');
      console.error('Please add DATABASE_URL to your server/.env file');
      process.exit(1);
    }

    // Mask password in connection string for logging
    const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
    console.log('🔗 Connecting to database:', maskedUrl);
    
    // Test connection first
    console.log('🔄 Testing database connection...');
    try {
      await pool.query('SELECT NOW()');
      console.log('✅ Database connection successful');
    } catch (connError: any) {
      console.error('❌ Database connection failed');
      console.error('Error details:', connError.message);
      
      if (connError.code === 'ENOTFOUND') {
        console.error('\n💡 Troubleshooting:');
        console.error('1. Check that your DATABASE_URL hostname is correct');
        console.error('2. Verify your Supabase project is fully provisioned (wait 2-3 minutes after creation)');
        console.error('3. Make sure you copied the connection string from:');
        console.error('   Supabase Dashboard → Settings → Database → Connection string → URI tab');
        console.error('4. The format should be:');
        console.error('   postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres');
      } else if (connError.code === 'ECONNREFUSED') {
        console.error('\n💡 Troubleshooting:');
        console.error('1. Check that the port (5432) is correct');
        console.error('2. Verify your firewall/network allows connections to Supabase');
      } else if (connError.code === '28P01') {
        console.error('\n💡 Troubleshooting:');
        console.error('1. Check that your database password is correct');
        console.error('2. URL-encode special characters in your password if needed');
      }
      
      await pool.end();
      process.exit(1);
    }
    
    console.log('🔄 Running database migrations...');
    
    const schema = readFileSync(join(process.cwd(), 'src/db/schema.sql'), 'utf-8');
    
    // Execute schema
    await query(schema);
    
    console.log('✅ Database migration completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    await pool.end();
    process.exit(1);
  }
}

migrate();
