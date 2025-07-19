#!/usr/bin/env node

import { config } from 'dotenv';
import { DAITKCore } from './core/DAITKCore.js';
import { Logger } from './utils/Logger.js';

// Load environment variables
config();

const logger = new Logger('DAITKTest');

async function main() {
  try {
    logger.info('Starting DAITK Test Project...');
    
    const core = new DAITKCore();
    await core.initialize();
    
    logger.info('DAITK Test Project initialized successfully');
    
    // Example usage
    await core.runExample();
    
  } catch (error) {
    logger.error('Failed to start DAITK Test Project:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the application
main().catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
}); 