module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // Disallow general console usage in application code.
    // We allow console.warn and console.error because:
    //   - console.error is used for audit/error logging where a logging framework
    //     may not be available (e.g. early bootstrapping, process-level failures).
    //   - console.warn is allowed for non-fatal operational warnings.
    // For application-level logging, prefer a proper logging framework that can be
    // configured per environment (e.g. debug levels, transports, formatting).
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  },
  // Examples and documentation snippets may use console.log freely for clarity.
  // We disable the no-console rule for those files to avoid noisy warnings.
  overrides: [
    {
      files: ['examples/basic-usage.ts'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
};
