import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import vue from 'eslint-plugin-vue';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

export default defineConfig(
  {
    files: ['src/**/*.{js,mjs,cjc,ts,tsx,vue}'],
    extends: [
      js.configs.recommended,
      ...ts.configs['recommended'],
      ...vue.configs['flat/recommended'],
    ],
    plugins: {
      '@stylistic': stylistic,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parser: vueParser,
      parserOptions: {
        parser: ts.parser,
      },
    },
    rules: {
      'vue/block-order': ['error', {
        'order': ['script', 'template', 'style']
      }],
      'vue/no-undef-components': ['error', {
        'ignorePatterns': []
      }],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: {
            max: 5,
          },
          multiline: {
            max: 1,
          },
        },
      ],
      'vue/html-indent': ['error', 2],
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',

      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',

      /** Замена prettier */
      '@stylistic/max-len' : [2, 150, { // аналог printWidth
          ignoreUrls : true,
          ignoreTrailingComments : true,
          ignoreRegExpLiterals : true,
          ignoreTemplateLiterals: true,
        },
      ],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/semi-spacing': ['error', { 'before': false, 'after': true }],
      '@stylistic/quotes': ['error', 'single'], // аналог singleQuote: true
      '@stylistic/comma-style': ['error', 'last'], // аналог trailingComma: all 
      '@stylistic/comma-spacing': ['error', { 'before': false, 'after': true }],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/no-trailing-spaces' : ['error'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/array-bracket-spacing' : ['error', "never"],
      '@stylistic/computed-property-spacing' : ['error', "never"],
      '@stylistic/object-curly-spacing' : ['error', "always"],
    },
  },
);