import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL is not set. Database operations will fail.');
}

// Database connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1')
    ? false 
    : { 
        rejectUnauthorized: false,
        require: true 
      },
  // Add connection timeout
  connectionTimeoutMillis: 30000,
  // Additional connection options for Supabase
  ...(process.env.DATABASE_URL?.includes('supabase.co') && {
    host: process.env.DATABASE_URL.match(/@([^:]+):/)?.[1],
    port: parseInt(process.env.DATABASE_URL.match(/:(\d+)\//)?.[1] || '5432'),
  }),
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};
