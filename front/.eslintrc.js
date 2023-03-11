module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:prettier/recommended',
        'plugin:jsx-a11y/strict',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'eslint-config-prettier'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2022,
        sourceType: 'module',
        settings: {
            react: {
              version: 'detect'
            },
            'import/resolver': {
              node: {
                paths: ['src'],
                extensions: ['.js', '.jsx', '.ts', '.tsx']
              }
            }
        }
    },
    plugins: ['react', 'jsx-a11y', '@typescript-eslint'],
    rules: {
        'react-hooks/exhaustive-deps': 'error',
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        semi: [2, 'always'],
        'no-var': 'error',
        'brace-style': 'error',
        'prefer-template': 'error',
        radix: 'error',
        'space-before-blocks': 'error',
        'import/prefer-default-export': 'off',
    },
    overrides: [
        {
            files: [
                '**/*.test.js',
                '**/*.test.jsx',
                '**/*.test.tsx',
                '**/*.spec.js',
                '**/*.spec.jsx',
                '**/*.spec.tsx',
            ],
            env: {
                jest: true,
            },
        },
    ],
};
