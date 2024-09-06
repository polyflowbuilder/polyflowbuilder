import js from '@eslint/js';
import ts from 'typescript-eslint';
import path from 'path';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'url';
import { includeIgnoreFile } from '@eslint/compat';

// get .gitignore path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  ...svelte.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      parserOptions: {
        extraFileExtensions: ['.svelte'],
        project: true
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    // lint failing starting with @typescript-eslint/eslint-plugin v7.18.0
    // (https://github.com/typescript-eslint/typescript-eslint/pull/8952)
    // TODO: revisit in the future if Svelte/SvelteKit addresses this
    rules: {
      '@typescript-eslint/unbound-method': 'off'
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      // ignore config files at root level
      '*.js',
      '*.cjs',
      '*.ts',
      '*.mjs'
    ]
  }
];
