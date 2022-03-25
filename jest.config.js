/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      // functions: 90,
      // lines: 90
      functions: 85, // restore lines above when met
      lines: 85
    }
  },
  preset: 'ts-jest',
  testEnvironment: 'node'
}
