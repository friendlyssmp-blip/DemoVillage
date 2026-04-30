import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*']
  },
  // Security rules linting is temporarily disabled due to a plugin configuration error
  // {
  //   files: ['**/*.rules'],
  //   plugins: {
  //     '@firebase/security-rules': firebaseRulesPlugin,
  //   },
  //   rules: {
  //     ...firebaseRulesPlugin.configs['flat/recommended'][1].rules,
  //   },
  // },
];
