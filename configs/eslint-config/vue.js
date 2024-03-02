module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
    "eslint:recommended",
    "plugin:import/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "no-undef": "off",
    "no-redeclare": "off",
    "no-unused-vars": "off",
    "vue/multi-word-component-names": "off",
    "vue/no-multiple-template-root": "off",
    "vue/no-setup-props-destructure": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "import/no-cycle": "warn",
    "import/no-unresolved": "off",
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts", ".vue"],
      },
    },
  },
};
