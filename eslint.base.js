// @ts-nocheck
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import eslintPluginImport from 'eslint-plugin-import'
import airbnbBase from 'eslint-config-airbnb-base'

export const tsConfig = {
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      tsconfigRootDir: import.meta.dirname,
      project: true,
    }
  },
  plugins: {
    '@typescript-eslint': tsPlugin,
    import: eslintPluginImport,
  },
  rules: {
    ...airbnbBase.rules,
    'comma-dangle': ['error', 'always-multiline'],
    'arrow-parens': ['error', 'always'],
    'max-len': ['error', {
      code: 100,
      tabWidth: 2,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
      ignoreComments: false,
    }],
    'semi': ['error', 'never'],
    'indent': ['error', 2, { SwitchCase: 1 }],
    'no-tabs': ['error'],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ThisExpression',
        message: '`this` is not allowed. Prefer dependency injection, closures, or functional patterns.',
      },
      {
        selector: 'ClassDeclaration',
        message: '`class` is not allowed. Use factory functions or closures instead.',
      },
      {
        selector: 'ClassExpression',
        message: '`class` expressions are not allowed. Use factory functions or closures instead.',
      },
    ],
    'object-curly-newline': ['error', {
      ImportDeclaration: { multiline: true, minProperties: 4 },
      ObjectExpression: { multiline: true, minProperties: 4 },
      ObjectPattern: { multiline: true, minProperties: 4 },
    }],
    'curly': ['error', 'all'],
    'quotes': ['error', 'single'],
    'array-element-newline': ['error', { multiline: true, minItems: 4 }],
    'function-paren-newline': ['error', 'multiline'],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-return-assign': ['error'],
    'func-style': ['error', 'expression'],
    'no-unused-expressions': ['error'],
    '@typescript-eslint/promise-function-async': ['error', {
      'allowAny': true,
      'checkArrowFunctions': true,
      'checkFunctionDeclarations': true,
      'checkFunctionExpressions': true,
      'checkMethodDeclarations': true,
    }],
    'keyword-spacing': ['error', { 'before': true, 'after': true }],
    // Surface `as any` in new code as a warning. Existing legit casts (custom
    // error props, dynamic response shapes) stay; this prevents drift in PRs.
    '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
  },
  settings: {
    'import/resolver': {
      typescript: { project: true },
    },
  },
}
