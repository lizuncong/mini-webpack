const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  mode: "development",
  entry: './src/index.js',
  devtool: "source-map",
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   use: ['loader2', 'loader1']
      // },
      {
        test: /\.js$/,
        use: {
          loader: path.resolve(__dirname, 'loaders', 'babel-loader'),
          options: {
            presets: [
              '@babel/preset-env'
            ]
          }
        }
      },
      {
        test: /\.(png|jpg)$/,
        use: path.resolve(__dirname, 'loaders', 'file-loader')
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          path.resolve(__dirname, 'loaders', 'less-loader')
        ]
      },
      {
        test: /\.css$/,
        use: [
          // path.resolve(__dirname, 'loaders', 'style-loader'),
          // path.resolve(__dirname, 'loaders', 'css-loader'),
          // 'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: false
            }
          },
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html"
    })
  ]
};
