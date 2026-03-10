/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\.{1,2}/.*)\.js$': '$1',
  },
};

module.exports = config;
