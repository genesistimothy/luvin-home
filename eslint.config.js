import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'

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
        fetch: 'readonly',
        IntersectionObserver: 'readonly',
        PopStateEvent: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        window: 'readonly',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: {version: 'detect'},
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...jsxA11y.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // This codebase doesn't use PropTypes (TypeScript/JSDoc cover typing instead).
      'react/prop-types': 'off',
    },
  },
  {
    files: ['sanity/**/*.js', 'sanity/**/*.mjs', 'api/**/*.js', 'tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        Buffer: 'readonly',
        fetch: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
  },
]
