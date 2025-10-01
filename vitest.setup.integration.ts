/**
 * Integration Test Setup
 * Sets up test environment for API and database testing
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./test.db';

beforeAll(async () => {
  console.log('🧪 Setting up integration test environment...');
  
  // Additional setup can go here
  // e.g., start test database, clear tables, etc.
});

afterAll(async () => {
  console.log('🧹 Cleaning up integration test environment...');
  
  // Cleanup can go here
  // e.g., close database connections, remove test files, etc.
});

beforeEach(async () => {
  // Reset state before each test if needed
});
