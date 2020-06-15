const webpackMerge = require("webpack-merge");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const commonConfig = require("./webpack.common.js");
const ImageminPlugin = require("imagemin-webpack-plugin").default;

const isEs5 = (env) => env && env.es5;

// If it's a es5 build, use babel env preset
// without additional configuration, which means it will transpile
// everything. If it's not a es5 build, .babelrc config is used
// (for modern browsers)

const getOptions = (env) => {
  if (!isEs5(env)) return {};

  return {
    babelrc: false,
    presets: ["@babel/env"],
  };
};

module.exports = (env) =>
  webpackMerge(commonConfig, {
    mode: "production",
    output: {
      filename: isEs5(env) ? "[name].es5.js" : "[name].js",
    },
    devtool: "source-map",
    optimization: {
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },
    plugins: [new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i })],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [/node_modules/],
          use: {
            loader: "babel-loader",
            options: getOptions(env),
          },
        },
      ],
    },
  });
