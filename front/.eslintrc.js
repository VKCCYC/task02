module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'plugin:vue-pug/vue3-recommended',
    'eslint:recommended',
    '@vue/standard'
  ],
  rules: {
    // 限制一行有幾個 html 屬性 ，老師把它關掉
    'vue/max-attributes-per-line': 'off'
  }
}
