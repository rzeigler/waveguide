module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    env: {
      browser: true,
      node: true,
      mocha: true,
      es6: true
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        "@typescript-eslint/explicit-function-return-type": ["error",  { allowExpressions: true, allowHigherOrderFunctions: true, allowTypedFunctionExpressions: true }],
        "@typescript-eslint/no-unused-vars": ["warn", {varsIgnorePattern: "^_.*", argsIgnorePattern: "^_.*"}],
        "quotes": ["warn", "double"]
    }
  };
