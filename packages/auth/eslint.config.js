module.exports = {
  root: true,
  extends: ["@repo/config-eslint/library"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  env: {
    es2022: true,
    node: true
  }
};