module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Correctly map the alias
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: ['next/babel'],
        plugins: ['@babel/plugin-transform-private-methods'],
      },
    ],
    '^.+\\.tsx?$': 'ts-jest', // For TypeScript files
    '^.+\\.js$': 'babel-jest', // For JavaScript files
    '^.+\\.json$': 'jest-transform-stub', // Use jest-transform-stub for JSON files
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: ['/node_modules/(?!react-toastify)/'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
};