module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:svelte/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    extraFileExtensions: ['.svelte'],
    project: true
  },
  env: {
    browser: true,
    es2017: true,
    node: true
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'off',
      {
        argsIgnorePattern: '_'
      }
    ],
    // lint failing starting with @typescript-eslint/eslint-plugin v7.18.0
    // (https://github.com/typescript-eslint/typescript-eslint/pull/8952)
    // TODO: revisit in the future if Svelte/SvelteKit addresses this
    '@typescript-eslint/unbound-method': ['off']
  }
};
