// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  globalIgnores([
    'dist/',
    'web-build/',
    '.expo/',
    'expo-env.d.ts',
    'android/',
    'ios/',
    'web/',
    'build/',
    'coverage/',
  ]),
  expoConfig,
  {
    // eslint-config-expo registers the @typescript-eslint plugin for TS files only
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    rules: {
      // React/React Native specific
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General best practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  },
  {
    // Node.js admin scripts (`node scripts/<name>.js`)
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: { __dirname: 'readonly', __filename: 'readonly' },
    },
    rules: {
      'no-console': 'off',
    },
  },
  // Keep last: enables prettier/prettier (options come from .prettierrc) and
  // eslint-config-prettier (turns off rules that conflict with Prettier)
  eslintPluginPrettierRecommended,
]);
