// eslint.config.js  (flat config — ESLint 9+)
import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        globalThis: 'readonly',
      },
    },
    rules: {
      // ── Errors ───────────────────────────────────────────────────────────
      'no-unused-vars':       ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console':           ['warn', { allow: ['warn', 'error'] }],
      'no-duplicate-imports': 'error',
      'no-return-await':      'error',   // async fn { return await x } → return x
      'require-await':        'error',   // async fn with no await is a bug

      // ── Style (Prettier handles formatting, ESLint handles logic) ─────────
      'prefer-const':         'error',
      'object-shorthand':     'error',   // { x: x } → { x }
      'no-var':               'error',
      'eqeqeq':               ['error', 'always'],
      'curly':                'error',

      // ── Node.js ───────────────────────────────────────────────────────────
      'no-process-exit':      'warn',    // use graceful shutdown instead
    },
  },
  {
    // Relax rules in test files
    files: ['tests/**/*.js', '**/*.test.js'],
    rules: {
      'no-console': 'off',
    },
  },
]
