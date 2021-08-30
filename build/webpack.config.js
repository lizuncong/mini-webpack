const path = require('path');
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  mode: "development",
  entry: './src/index.js',
  // devtool: false,
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build'),
  },
  // devServer: {
  //   port: 8004,
  //   contentBase: './build',
  //   // compress: true
  // },
  module: {
    rules: [
      {
        test: /\.css$/,
        // css-loader 处理@import这种语法的
        // style-loader 把css插入到head的标签中
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        // css-loader 处理@import这种语法的
        // style-loader 把css插入到head的标签中
        use: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      DEV: JSON.stringify('dev')
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html'
    })
  ]
};