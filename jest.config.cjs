/** @type {import('jest').Config} */
const config = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // File extensions to test
  moduleFileExtensions: ['js', 'ts', 'vue'],
  
  // Transform files
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(js|ts)$': 'babel-jest',
  },
  
  // Module name mapping for aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
    '^~/(.*)$': '<rootDir>/app/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  
  // Test patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.(js|ts)',
    '<rootDir>/tests/**/*.spec.(js|ts)',
  ],
  
  // Coverage
  collectCoverageFrom: [
    'app/**/*.{js,ts,vue}',
    '!app/**/*.d.ts',
    '!app/nuxt.config.ts',
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Test environment options
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(@vue|vue|@nuxt|nuxt)/)',
  ],
};

module.exports = config;
