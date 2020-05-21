const path = require("path");
const webpack = require('webpack');
const entries = require('./entries.js');

module.exports = {
  entry: entries,
  mode: "development",
  devtool: "inline-source-map",
  context: path.resolve(__dirname, "../webcompat/static"),
  output: {
    path: path.join(__dirname, "../webcompat/static/js/dist-new")
  },
  module: {
    rules: [
      {
        test: /\.jst$/,
        use: [
          {
            loader: path.resolve(__dirname, './loaders/strip-tags.js'),
          },
          {
            loader: 'ejs-loader'
          }
        ]
      }
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, "../webcompat/static/js")],
    alias: {
      templates: path.resolve(__dirname, '../webcompat/templates/'),
      jquery: "vendor/jquery-3.3.1.min.js",
      underscore: "vendor/lodash.custom.min.js",
      Backbone: "vendor/backbone-1.3.3.min.js",
      Mousetrap: "vendor/mousetrap-min.js",
      Prism: "vendor/prism.js",
      BackboneMousetrap: "vendor/backbone.mousetrap.js"
    }
  },
  plugins: [
    //make underscore and jquery global for jst templates
    new webpack.ProvidePlugin({
      _: "underscore"
    }),
    new webpack.ProvidePlugin({
      $: "jquery"
    })
  ]
};

