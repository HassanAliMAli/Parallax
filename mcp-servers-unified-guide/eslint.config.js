import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import markdown from '@eslint/markdown';
import jsonc from 'eslint-plugin-jsonc';
import jsoncParser from 'jsonc-eslint-parser';
import globals from 'globals';

export default tseslint.config(
  {
    name: 'mcp-unified-guide/ignores',
    ignores: ['node_modules', 'dist', 'build', 'coverage'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.node,
    },
  },
  jsonc.configs['recommended-with-json'],
  {
    files: ['**/*.json', '**/*.jsonc'],
    languageOptions: {
      parser: jsoncParser,
    },
  },
  ...markdown.configs.recommended,
  prettier
);
