// @ts-check
// Chuyen tu .eslintrc.json (Angular 13): giu nguyen bo rule cu,
// chi dung bo khuyen nghi cua angular-eslint, prefix "kt" va "m".
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    ignores: ["projects/**/*", "src/assets/**/*"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
    },
    extends: [angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      // Rule moi tu angular-eslint 17-22, doi viet lai code theo kieu moi;
      // bo rule cu khong co nen tat de lint chi bao loi that.
      "@angular-eslint/prefer-inject": "off",
      "@angular-eslint/prefer-standalone": "off",
      "@angular-eslint/prefer-on-push-component-change-detection": "off",
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: ["kt", "m"],
          style: "kebab-case",
        },
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: ["kt", "m"],
          style: "camelCase",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [angular.configs.templateRecommended],
    rules: {
      "@angular-eslint/template/prefer-control-flow": "off",
    },
  },
]);
