import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginJsdoc from 'eslint-plugin-jsdoc';
import pluginJson from 'eslint-plugin-json';
import mochaPlugin from 'eslint-plugin-mocha';
// TODO wait for eslint-plugin-import to be usable in eslint v9; corresponding
// issue see https://github.com/import-js/eslint-plugin-import/issues/2948

export default [
  pluginJs.configs.recommended,
  pluginJsdoc.configs['flat/recommended'],
  mochaPlugin.configs.flat.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.nodeBuiltin,
        ...globals.mocha,
      },
    },
    rules: {
      'mocha/no-mocha-arrows': 'off',
    },
  },
  {
    files: ['**/*.json'],
    // TODO pluginJson - allowComments throws; wait for fix; until then exclude files with comments
    // see https://github.com/azeemba/eslint-plugin-json/pull/82#issuecomment-2081391823
    ignores: ['**/.vscode/launch.json'],
    plugins: {
      pluginJson,
    },
    processor: pluginJson.processors['.json'],
    rules: {
      // TODO allowComments throws; wait for fix 'pluginJson/*': ['error', { allowComments: true }],
      'pluginJson/*': 'error',
    },
  },
];
