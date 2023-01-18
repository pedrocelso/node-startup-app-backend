module.exports = {
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ]
  },
  transformIgnorePatterns: ['/node_modules/', '/build/'],
  preset: 'ts-jest/presets/js-with-ts-esm',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
  ],
  coveragePathIgnorePatterns: [
    "node_modules",
    "<rootDir>/src/server.ts",
    "<rootDir>/src/db/data-load.ts"
  ],
  coverageReporters: [['text', { skipFull: true }]],
  rootDir: "./",
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
}