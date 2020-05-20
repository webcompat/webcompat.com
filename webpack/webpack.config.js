const path = require("path");
const webpack = require('webpack');

module.exports = {
  entry: {
    index: [
      "./js/lib/models/label-list.js",
      "./js/lib/models/issue.js",
      "./js/lib/untriaged.js",
    ],
    formv2: [
      "./js/lib/wizard/app.js",
      "./js/lib/issue-wizard-popup.js",
      "./js/lib/issue-wizard-slider.js",
      "./js/lib/autogrow-textfield.js"
    ],
    vendors: ["jquery", "underscore", "Backbone"]
  },
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
    modules: [path.resolve(__dirname, "../webcompat/static/js/vendor")],
    alias: {
      jquery: "jquery-3.3.1.min.js",
      underscore: "lodash-new.custom.min.js",
      Backbone: "backbone-1.3.3.min.js",
      templates: path.resolve(__dirname, '../webcompat/templates/')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      _: "underscore"
    })
  ]
};



// form v2 to do
//   "<%= jsPath %>/vendor/lodash.custom.min.js",
//   "<%= jsPath %>/vendor/moment-min.js",
//   "<%= jsPath %>/vendor/prism.js",
//   "<%= jsPath %>/vendor/mousetrap-min.js",
//   "<%= jsPath %>/vendor/backbone.mousetrap.js",
//   "<%= jsPath %>/lib/flash-message.js",

//   "<%= jsDistPath %>/templates.js",
//   "<%= jsPath %>/lib/navbar.js",
