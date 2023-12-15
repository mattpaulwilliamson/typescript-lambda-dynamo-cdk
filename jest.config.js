module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['/**/*.spec.ts'],
  collectCoverageFrom: ['<rootDir>/**/*.ts', '!<rootDir>/types/**/*.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      diagnostics: false
    }]
  },
};
