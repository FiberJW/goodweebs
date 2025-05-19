// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const reactCompiler = require("eslint-plugin-react-compiler");

module.exports = defineConfig([
  expoConfig,
  reactCompiler.configs.recommended,
  globalIgnores(["dist/*", "graphql/generated.tsx"]),
  {
    rules: {
      "react-compiler/react-compiler": "error",
      "react-native/no-inline-styles": 0,
      "react-native/no-raw-text": 0,
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
          },
          pathGroups: [
            {
              pattern: "yep/**",
              group: "external",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
    },
  },
]);
