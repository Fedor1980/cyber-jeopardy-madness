import dotenv from 'dotenv';
import { EnvConfig } from '../types';

dotenv.config();

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

export const config: EnvConfig = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 3001),
  API_VERSION: getEnvVariable('API_VERSION', 'v1'),

  // Database
  DB_HOST: getEnvVariable('DB_HOST', 'localhost'),
  DB_PORT: getEnvNumber('DB_PORT', 5432),
  DB_NAME: getEnvVariable('DB_NAME', 'cyber_jeopardy'),
  DB_USER: getEnvVariable('DB_USER', 'postgres'),
  DB_PASSWORD: getEnvVariable('DB_PASSWORD'),

  // JWT
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVariable('JWT_EXPIRES_IN', '24h'),
  JWT_REFRESH_SECRET: getEnvVariable('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: getEnvVariable('JWT_REFRESH_EXPIRES_IN', '7d'),

  // CORS
  CORS_ORIGIN: getEnvVariable('CORS_ORIGIN', 'http://localhost:5173'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
  RATE_LIMIT_MAX_REQUESTS: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),

  // AI (optional)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,

  // Logging
  LOG_LEVEL: getEnvVariable('LOG_LEVEL', 'info'),

  // Security
  BCRYPT_ROUNDS: getEnvNumber('BCRYPT_ROUNDS', 12),
};

// Validate critical configuration
if (config.NODE_ENV === 'production') {
  if (config.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  if (config.CORS_ORIGIN === 'http://localhost:5173') {
    throw new Error('CORS_ORIGIN must be set to production URL');
  }
}
