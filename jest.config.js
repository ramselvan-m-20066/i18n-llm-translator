export default {
  preset: null,
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.js' }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|ora|jsonc-parser)/)'
  ],
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};