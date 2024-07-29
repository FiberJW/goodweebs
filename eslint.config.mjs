// @ts-check

import eslintPluginUnicorn from "eslint-plugin-unicorn";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
  },
  {
    ignores: ["graphql/generated.tsx", "dist/*", "**/web-build"],
  },
  js.configs.recommended,

  eslintPluginUnicorn.configs["flat/recommended"],
];
