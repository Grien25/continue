import { beforeEach, describe, expect, it } from 'vitest';
import { DAITKConfig } from '../types/index.js';
import { DAITKCore } from './DAITKCore.js';

describe('DAITKCore', () => {
  let core: DAITKCore;
  let mockConfig: DAITKConfig;

  beforeEach(() => {
    mockConfig = {
      apiKey: 'test-api-key',
      baseUrl: 'https://test.api.daitk.dev',
      timeout: 5000,
      debug: true,
    };
    core = new DAITKCore(mockConfig);
  });

  describe('initialization', () => {
    it('should initialize successfully with valid config', async () => {
      await expect(core.initialize()).resolves.not.toThrow();
      expect(core.isReady()).toBe(true);
    });

    it('should not initialize twice', async () => {
      await core.initialize();
      await core.initialize(); // Should not throw
      expect(core.isReady()).toBe(true);
    });
  });

  describe('configuration', () => {
    it('should return current configuration', () => {
      const config = core.getConfig();
      expect(config.apiKey).toBe(mockConfig.apiKey);
      expect(config.baseUrl).toBe(mockConfig.baseUrl);
      expect(config.timeout).toBe(mockConfig.timeout);
      expect(config.debug).toBe(mockConfig.debug);
    });

    it('should update configuration', () => {
      const newConfig = { timeout: 10000, debug: false };
      core.updateConfig(newConfig);

      const config = core.getConfig();
      expect(config.timeout).toBe(10000);
      expect(config.debug).toBe(false);
    });
  });

  describe('example operation', () => {
    it('should run example operation successfully', async () => {
      await core.initialize();

      const result = await core.runExample();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('example-123');
      expect(result.data?.name).toBe('DAITK Test Example');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('shutdown', () => {
    it('should shutdown gracefully', async () => {
      await core.initialize();
      expect(core.isReady()).toBe(true);

      await core.shutdown();
      expect(core.isReady()).toBe(false);
    });
  });
});
