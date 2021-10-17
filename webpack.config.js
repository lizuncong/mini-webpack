const path = require('path');
module.exports = {
  mode: "development",
  entry: './src/index.js',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'loader1',
      },
      {
        test: /\.js$/,
        use: 'loader2',
        enforce: "pre"
      },
      {
        test: /\.js$/,
        use: 'loader3',
      },
      {
        test: /\.js$/,
        use: 'loader4',
        enforce: "post"
      },
    ]
  }
};
