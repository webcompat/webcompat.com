const webpackMerge = require("webpack-merge");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const commonConfig = require("./webpack.common.js");
const ImageminPlugin = require("imagemin-webpack-plugin").default;

module.exports = () =>
  webpackMerge(commonConfig, {
    mode: "production",
    devtool: "source-map",
    optimization: {
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },
    plugins: [new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i })],
  });
