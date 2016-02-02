// webpack.config.js
var webpack = require("webpack")
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var path = require("path")
var options = require("minimist")(process.argv.slice(2))


var ext = function ext() {
  for (var _len = arguments.length, suffix = Array(_len), _key = 0; _key < _len; _key++) {
    suffix[_key] = arguments[_key];
  }

  return new RegExp('\\.(?:' + suffix.join('|') + ')(?:[?#].*)?$');
};

module.exports = {
  // The standard entry point and output config
  entry: {
    webcompat: "./webcompat/static/src/webcompat.js",
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "./webcompat/static/build"),
    publicPath: "",
  },
  resolve: {
    extensions: [
      "",
      ".js",
      ".css",
    ],
  },
  cssnext: {
    url: true,
    browsers: ['ff >= 20', 'ie >= 9', 'safari >= 5.1', 'opera >= 12', 'chrome >=20'],
    compress: options.production,
    sourcemap: !options.production,
    messages: {browser: false, console: true}
  },
  svg : {
    plugins: [
      {removeTitle: true, removeDesc: true},
      {convertColors: {shorthex: false}},
      {convertPathData: false},
    ],
  },
  module: {
    loaders: [
      { test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      { test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          "style",
          "css!cssnext"
        )
      },
      {
        test: ext('svg', 'otf', 'eot', 'ttf', 'woff2?', "png", "gif", "jp?g"),
        loaders : [
          "file?name=[hash].[ext]",
          'image-webpack?{progressive:true, optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}}'
        ],
      },
      {
        test : /\.svg$/,
        loaders : [
          "svgo?useConfig=svg",
        ],
      },

    ]
  },
  // Use the plugin to specify the resulting filename (and add needed behavior to the compiler)
  plugins: [
    new ExtractTextPlugin("[name].css"),
    new webpack.ProvidePlugin({
            $: "jquery"
        })
  ]
}
