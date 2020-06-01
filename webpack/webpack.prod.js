const webpackMerge = require("webpack-merge");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const commonConfig = require("./webpack.common.js");

module.exports = () =>
  webpackMerge(commonConfig, {
    mode: "production",
    devtool: "source-map",
    optimization: {
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },
  });
