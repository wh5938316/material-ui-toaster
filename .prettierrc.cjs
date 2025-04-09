/** @type {import("prettier").Config} */
module.exports = {
  singleQuote: true,
  printWidth: 100,
  bracketSpacing: true,
  jsxSingleQuote: false,
  proseWrap: 'always',
  semi: true,
  tabWidth: 2,
  trailingComma: 'all',
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  overrides: [],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
};
