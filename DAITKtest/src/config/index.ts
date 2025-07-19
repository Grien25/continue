import { DAITKConfig } from '../types/index.js';

export function loadConfig(): DAITKConfig {
  return {
    apiKey: process.env.DAITK_API_KEY,
    baseUrl: process.env.DAITK_BASE_URL || 'https://api.daitk.dev',
    timeout: parseInt(process.env.DAITK_TIMEOUT || '30000'),
    debug: process.env.DAITK_DEBUG === 'true',
  };
}

export function validateConfig(config: DAITKConfig): string[] {
  const errors: string[] = [];

  if (!config.apiKey) {
    errors.push('DAITK_API_KEY is not set');
  }

  if (config.timeout && (config.timeout < 1000 || config.timeout > 300000)) {
    errors.push('DAITK_TIMEOUT must be between 1000 and 300000 milliseconds');
  }

  return errors;
}

export function getDefaultConfig(): DAITKConfig {
  return {
    apiKey: undefined,
    baseUrl: 'https://api.daitk.dev',
    timeout: 30000,
    debug: false,
  };
} 