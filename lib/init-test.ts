// Initialize test environment
import { enableMockDatabase } from './db-mock';

export function initializeTestEnvironment() {
  if (process.env.NODE_ENV === 'development' && process.env.LOCAL_TEST_MODE !== 'false') {
    console.log('🧪 Initializing test environment...');
    
    // Enable mock database only if explicitly in test mode
    enableMockDatabase();
    
    // Set test mode environment variable
    process.env.LOCAL_TEST_MODE = 'true';
    
    console.log('🧪 Test environment initialized');
    console.log('  - Mock database: enabled');
    console.log('  - Mock fulfillment: enabled');
    console.log('  - Test configurations: loaded');
  } else if (process.env.LOCAL_TEST_MODE === 'false') {
    console.log('🚀 Production mode: Using real Supabase database');
  }
}

// Auto-initialize in development
if (typeof window === 'undefined') { // Server-side only
  initializeTestEnvironment();
}
