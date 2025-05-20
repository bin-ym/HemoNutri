import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginJson from 'eslint-plugin-json';
import pluginCss from 'eslint-plugin-css';

export default [
  // JavaScript and TypeScript files
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        Promise: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
      },
    },
    plugins: {
      react: pluginReact,
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...pluginReact.configs.flat.recommended.rules,
      'react/prop-types': 'off',
    },
  },
  // JSON files
  {
    files: ['**/*.json'],
    plugins: {
      json: pluginJson,
    },
    processor: 'json/json',
    rules: {
      'json/*': ['error'],
    },
  },
  // CSS files
  {
    files: ['**/*.css'],
    plugins: {
      css: pluginCss,
    },
    processor: 'css/css',
    rules: {
      'css/no-dupe-properties': 'error',
      'css/no-invalid-color': 'error',
    },
  },
];