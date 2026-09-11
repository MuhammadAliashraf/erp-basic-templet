import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', '*.tsbuildinfo'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  // `configs.flat.*` is the flat-config shape; the top-level `configs.recommended`
  // is still the legacy eslintrc object and is rejected by ESLint 9+.
  reactHooks.configs.flat['recommended-latest'],

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      /* Import hygiene — deterministic ordering keeps diffs small. */
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      /* TypeScript */
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      /* General correctness */
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'object-shorthand': ['error', 'always'],

      /* Architecture boundary: features must be imported through their
         public barrel, never by reaching into internal files. */
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*'],
              message: 'Use the "@/" absolute import alias instead of deep relative paths.',
            },
            {
              group: ['@/features/*/*'],
              message:
                'Import from the feature barrel (@/features/<name>) instead of its internals.',
            },
          ],
        },
      ],
    },
  },

  /* The store wires slices together and legitimately crosses feature barrels. */
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/features/**/index.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },

  /* The route table is a manifest of lazy components, not a component module,
     so the Fast Refresh single-export rule does not apply to it. */
  {
    files: ['src/app/router/routes.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  /* Node-side config files. */
  {
    files: ['vite.config.ts', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
  },

  prettier,
);
