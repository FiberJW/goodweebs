module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["@nkzw/babel-preset-fbtee", "babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            yep: "./",
          },
        },
      ],
    ],
  };
};
