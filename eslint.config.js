import js from "@eslint/js";
import globals from "globals";

export default [
  // Base configuration for JavaScript files only
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  // Ignore patterns
  {
    ignores: [
      ".*.js",
      "*.setup.js",
      "*.config.js",
      ".turbo/",
      "dist/**",
      "coverage/",
      "node_modules/",
      ".husky/",
      ".next/",
      "**/*.d.ts",
      "**/*.ts",
      "**/*.tsx",
    ],
  },
];
