/**
 * Database Setup Script
 * Creates necessary tables and seeds initial data
 */

import { db } from '../server/db';
import { users, subscriptionPlans } from '../shared/schema';
import { seedSubscriptionPlans } from '../server/scripts/seedSubscriptionPlans';
import { seedTemplates } from '../server/scripts/seedTemplates';

async function setupDatabase() {
  console.log('🔧 Setting up database...\n');
  
  try {
    // Test database connection
    console.log('1️⃣  Testing database connection...');
    await db.execute('SELECT 1');
    console.log('✅ Database connection successful\n');
    
    // Check if tables exist
    console.log('2️⃣  Checking database tables...');
    const tablesExist = await checkTables();
    
    if (!tablesExist) {
      console.log('⚠️  Tables not found. Please run migrations first:');
      console.log('   npm run db:push\n');
      process.exit(1);
    }
    console.log('✅ Database tables verified\n');
    
    // Seed subscription plans
    console.log('3️⃣  Seeding subscription plans...');
    try {
      await seedSubscriptionPlans();
      console.log('✅ Subscription plans seeded\n');
    } catch (error: any) {
      if (error?.message?.includes('already exists') || error?.code === '23505') {
        console.log('ℹ️  Subscription plans already exist\n');
      } else {
        throw error;
      }
    }
    
    // Seed project templates
    console.log('4️⃣  Seeding project templates...');
    try {
      await seedTemplates();
      console.log('✅ Project templates seeded\n');
    } catch (error: any) {
      if (error?.message?.includes('already exists')) {
        console.log('ℹ️  Templates already exist\n');
      } else if (error?.code === 'EAI_AGAIN' || error?.syscall === 'getaddrinfo') {
        console.log('⚠️  Template seeding skipped (network unavailable)\n');
      } else {
        console.warn('⚠️  Template seeding failed:', error?.message);
      }
    }
    
    console.log('🎉 Database setup completed successfully!\n');
    console.log('Next steps:');
    console.log('  - Start the server: npm run dev');
    console.log('  - Create your first project in the application\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

async function checkTables(): Promise<boolean> {
  try {
    // Try to query a known table
    await db.select().from(users).limit(1);
    return true;
  } catch (error) {
    return false;
  }
}

setupDatabase();
