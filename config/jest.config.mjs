// jest.config.mjs - TypeScript ES Module configuration (React-enabled)
// Use ESM export to avoid CommonJS issues under "type": "module"
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

export default {
  preset: 'ts-jest/presets/default-esm',
  rootDir: PROJECT_ROOT,
  testEnvironment: 'node',
  // Ensure CommonJS require() exists in ESM tests
  setupFiles: [path.join(PROJECT_ROOT, 'config', 'jest-require-polyfill.cjs')],
  setupFilesAfterEnv: [path.join(PROJECT_ROOT, 'config', 'jest-setup.ts')],
  roots: [PROJECT_ROOT],
  testMatch: [
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/*.test.js",
  "**/*.test.jsx",
  "**/*.spec.ts",
  "**/*.spec.tsx",
  "**/*.spec.js",
  "**/*.spec.jsx",
  "**/*.GenerateTest.test.ts",
  "**/*.GenerateTest.test.tsx",
  "**/*.GeneratedTest.test.ts",
  "**/*.GeneratedTest.test.tsx",
  "**/manual-tests/**/*.test.ts",
  "**/generated-tests/**/*GeneratedTest*.test.ts",
  "**/generated-tests/**/*GeneratedTest*.test.tsx"
],
  testPathIgnorePatterns: [
  "/node_modules/",
  "/\\.cache/",
  "/\\.local/",
  "/\\.upm/",
  "/agentRecords/",
  "/attached_assets/",
  "/coverage/",
  "/logs/",
  "/dist/",
  "/build/",
  "/__mocks__/"
],
  // Harden ignores to avoid duplicate manual mocks and compiled artifacts
  modulePathIgnorePatterns: [
    '<rootDir>/.cache/',
    '<rootDir>/.local/',
    '<rootDir>/.upm/',
    '<rootDir>/agentRecords/',
    '<rootDir>/attached_assets/',
    '<rootDir>/coverage/',
    '<rootDir>/logs/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  watchPathIgnorePatterns: [
    '<rootDir>/.cache/',
    '<rootDir>/.local/',
    '<rootDir>/.upm/',
    '<rootDir>/agentRecords/',
    '<rootDir>/attached_assets/',
    '<rootDir>/coverage/',
    '<rootDir>/logs/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  moduleFileExtensions: ["ts","tsx","js","jsx","json"],
  transform: {
  "^.+\\.(ts|tsx)$": [
    "ts-jest",
    {
      "useESM": true,
      "tsconfig": path.join(PROJECT_ROOT, "tsconfig.json")
    }
  ],
  "^.+\\.(js|jsx)$": [
    "babel-jest",
    {
      "presets": [
        [
          "@babel/preset-env",
          {
            "targets": {
              "node": "current"
            }
          }
        ]
      ]
    }
  ]
},
  extensionsToTreatAsEsm: [".ts",".tsx"],
  transformIgnorePatterns: ['node_modules/(?!(?:qtests|@tanstack|@radix-ui|lucide-react|react-resizable-panels|cmdk|vaul)/)'],
  moduleNameMapper: {
  // Map qtests subpath imports to built dist files (setup.js lives under dist)
  "^qtests/(.*)$": "<rootDir>/node_modules/qtests/dist/$1",
  "^qtests$": "<rootDir>/node_modules/qtests/dist/index.js",
  "^qerrors$": "<rootDir>/config/jest-qerrors-proxy.cjs",
  "^(\\.{1,2}/.*)\\.js$": "$1"
}
};
