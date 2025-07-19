import { LoggerConfig } from '../types/index.js';

export class Logger {
  private context: string;
  private config: LoggerConfig;

  constructor(context: string, config?: Partial<LoggerConfig>) {
    this.context = context;
    this.config = {
      level: 'info',
      format: 'text',
      timestamp: true,
      ...config,
    };
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = this.config.timestamp ? new Date().toISOString() : '';
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;
    
    if (this.config.format === 'json') {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        context: this.context,
        message,
        data,
      });
    }
    
    return `${prefix} ${message}${data ? ` ${JSON.stringify(data)}` : ''}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, error));
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
} 