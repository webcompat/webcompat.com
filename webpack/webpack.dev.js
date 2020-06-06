const webpackMerge = require("webpack-merge");
const commonConfig = require("./webpack.common.js");

module.exports = () =>
  webpackMerge(commonConfig, {
    mode: "development",
    devtool: "inline-source-map",
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [/node_modules/],
          use: {
            loader: "babel-loader",
          },
        },
      ],
    },
  });
