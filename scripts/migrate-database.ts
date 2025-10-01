/**
 * Database Migration Script
 * Run with: npm run db:migrate
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../shared/schema';

async function runMigrations() {
  console.log('🔄 Starting database migrations...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  // Check if using PostgreSQL
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    console.log('⚠️  Skipping migrations - SQLite detected (migrations not needed)');
    process.exit(0);
  }
  
  try {
    // Create connection
    const connection = postgres(databaseUrl, { max: 1 });
    const db = drizzle(connection, { schema });
    
    // Run migrations
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('✅ Database migrations completed successfully');
    
    // Close connection
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
