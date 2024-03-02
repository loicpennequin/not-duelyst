module.exports = {
  root: true,
  extends: ['@nuxt/eslint-config', 'daria/vue'],
  rules: {
    'vue/singleline-html-element-content-newline': 'off',
    'import/no-unresolved': ['error', { ignore: ['\\.glsl$'] }]
  }
};
