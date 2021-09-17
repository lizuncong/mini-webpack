const path = require('path');
module.exports = {
  mode: "development",
  // entry: ['./src/index.js', './src/index2.js'],
  entry: {
    main: ['./src/index.js', './src/index2.js'],
    main2: './src/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {}
};