import js from '@eslint/js'

export default [
  {
    ignores: ['dist/**', 'sanity/dist/**', 'sanity/.sanity/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {ecmaFeatures: {jsx: true}},
      globals: {
        AbortController: 'readonly',
        console: 'readonly',
        document: 'readonly',
        IntersectionObserver: 'readonly',
        window: 'readonly',
      },
    },
  },
  {
    files: ['src/**/*.jsx'],
    rules: {
      // Core ESLint does not resolve JSX references without a React plugin.
      // Vite and TypeScript still validate imports and JSX during build/typecheck.
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['sanity/**/*.js', 'sanity/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
]
