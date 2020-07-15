module.exports = {
  plugins: [
    require("postcss-import"),
    require("postcss-url"),
    require("postcss-preset-env")({
      browsers: ["defaults", "Firefox > 52", "Safari >=9", "Chrome >=75"],
    }),
  ],
};
