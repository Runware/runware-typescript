// @ts-nocheck
import { tsConfig } from './eslint.base.js'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/types/task-map.ts',
    ],
  },
  {
    ...tsConfig,
    languageOptions: {
      ...tsConfig.languageOptions,
      parserOptions: {
        ...tsConfig.languageOptions.parserOptions,
        project: './tsconfig.eslint.json',
      },
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.eslint.json' },
      },
    },
  },
  // Test files can use a few patterns the production code intentionally avoids
  // (mock classes from test frameworks, plain `this` in describe blocks, etc.).
  {
    files: ['test/**/*.ts'],
    rules: {
      'no-restricted-syntax': 'off',
      'func-style': 'off',
      'no-unused-expressions': 'off',
      // `as any` is the idiomatic way to type test mocks/fixtures
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Build-time scripts walk arbitrary JSON Schemas — the data is inherently
  // dynamic and typing every node would just push the same `any` around.
  {
    files: ['scripts/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
