import { DAITKConfig, DAITKResponse, ExampleData } from '../types/index.js';
import { Logger } from '../utils/Logger.js';

export class DAITKCore {
  private config: DAITKConfig;
  private logger: Logger;
  private isInitialized: boolean = false;

  constructor(config?: DAITKConfig) {
    this.config = {
      apiKey: process.env.DAITK_API_KEY,
      baseUrl: process.env.DAITK_BASE_URL || 'https://api.daitk.dev',
      timeout: parseInt(process.env.DAITK_TIMEOUT || '30000'),
      debug: process.env.DAITK_DEBUG === 'true',
      ...config,
    };

    this.logger = new Logger('DAITKCore', {
      level: this.config.debug ? 'debug' : 'info',
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('DAITKCore is already initialized');
      return;
    }

    this.logger.info('Initializing DAITKCore...');

    // Validate configuration
    if (!this.config.apiKey) {
      this.logger.warn('No API key provided, some features may be limited');
    }

    // Perform any initialization tasks
    await this.validateConnection();

    this.isInitialized = true;
    this.logger.info('DAITKCore initialized successfully');
  }

  private async validateConnection(): Promise<void> {
    try {
      this.logger.debug('Validating connection to DAITK services...');
      
      // Simulate connection validation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.logger.debug('Connection validation completed');
    } catch (error) {
      this.logger.error('Failed to validate connection:', error);
      throw new Error('Failed to initialize DAITKCore: connection validation failed');
    }
  }

  async runExample(): Promise<DAITKResponse<ExampleData>> {
    this.logger.info('Running example operation...');

    try {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 500));

      const exampleData: ExampleData = {
        id: 'example-123',
        name: 'DAITK Test Example',
        description: 'This is an example data structure for the DAITK test project',
        createdAt: new Date(),
      };

      this.logger.info('Example operation completed successfully', { data: exampleData });

      return {
        success: true,
        data: exampleData,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Example operation failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  getConfig(): DAITKConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<DAITKConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Configuration updated', { newConfig });
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down DAITKCore...');
    
    // Perform cleanup tasks
    this.isInitialized = false;
    
    this.logger.info('DAITKCore shutdown completed');
  }
} 