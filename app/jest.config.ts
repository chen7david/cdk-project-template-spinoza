import type { InitialOptionsTsJest } from 'ts-jest/dist/types'

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', '<rootDir>'],
  setupFilesAfterEnv: ['jest-expect-message', '<rootDir>/tests/mocks/logger.mock.ts'],
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
}

export default config;