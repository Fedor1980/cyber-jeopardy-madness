// Jest setup file for backend tests
import { config } from '../src/config/env';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'cyber_jeopardy_test';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_minimum_32_characters_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_testing_minimum_32_characters_long';

// Global test timeout
jest.setTimeout(30000);

// Mock logger to reduce noise in test output
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  morganStream: {
    write: jest.fn(),
  },
}));
