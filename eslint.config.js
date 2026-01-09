import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['lib/**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      globals: {
        // Node.js globals
        node: true,
        console: true,
        process: true,
        Buffer: true,
        __dirname: true,
        __filename: true,
        global: true,
        setTimeout: true,
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
        require: true,
        module: true,
        exports: true,
        
        // Test globals
        beforeAll: true,
        afterAll: true,
        beforeEach: true,
        afterEach: true,
        describe: true,
        it: true,
        test: true,
        expect: true,
        jest: true,
        
        // Node.js specific globals
        NodeJS: true,
        setImmediate: true,
        clearImmediate: true,
        Console: true,
        requestAnimationFrame: true
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      // JavaScript/ES6 rules (relaxed for existing codebase)
      'no-console': 'off',
      'no-debugger': 'error',
      'no-unused-vars': 'off',
      'no-undef': 'error',
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single'],
      'indent': 'off',
      'brace-style': 'off',
      'curly': 'off',
      'eqeqeq': 'warn',
      'no-trailing-spaces': 'off',
      'eol-last': 'off',
      'no-case-declarations': 'off',
      'no-prototype-builtins': 'off',
      'no-compare-neg-zero': 'off',
      'no-control-regex': 'off',
      'no-useless-escape': 'off',
      
      // TypeScript specific rules (relaxed)
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',

      // Security rules (relaxed for existing codebase)
      'no-eval': 'warn',
      'no-implied-eval': 'off',
      'no-new-func': 'off',
      'no-script-url': 'warn',
      'no-empty': 'warn',
      'no-useless-catch': 'warn'
    },
    settings: {
      'import/resolver': {
        typescript: {}
      }
    }
  },
  {
    files: ['**/*.test.ts', '**/*.test.js', '**/test/**', 'config/**'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
    },
  js.configs.recommended,
  {
    files: ['examples/**/*.cjs', 'examples/**/*.js', 'browser-utils.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        // Browser globals for examples
        window: true,
        document: true,
        navigator: true,
        Blob: true,
        URL: true,
        URLSearchParams: true,
        AbortController: true,
        AbortSignal: true,
        Response: true,
        fetch: true,
        performance: true,
        console: true,
        process: true,
        Buffer: true,
        __dirname: true,
        __filename: true
      }
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'warn',
      'no-undef': 'off'
    }
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '.cache/**',
      'agentRecords/**',
      '.local/**',
      '*.min.js',
      '**/*.d.ts',
      '*.cjs', // Legacy CommonJS files (except examples handled above)
      'debug-*.cjs', // Debug files
      'benchmarks/**',
      'analyze-*.cjs',
      'final-*.cjs',
      'fix-*.js',
      'demo-*.mjs',
      'test-*.js',
      '*test-runner.js'
    ]
  }
];
