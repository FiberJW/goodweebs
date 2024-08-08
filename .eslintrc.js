// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  ignorePatterns: ["graphql/generated.tsx", "dist/*", "web-build"],
  extends: ["expo", "plugin:import/recommended", "plugin:import/typescript"],
  rules: {
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
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
};
