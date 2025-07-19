export interface DAITKConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
}

export interface DAITKResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  timestamp: boolean;
}

export interface ExampleData {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
} 