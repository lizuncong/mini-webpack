const webpack = require('./lib/webpack.js')
// const webpack = require('webpack')
const options = require('../webpack.config')
debugger;

const compiler = webpack(options)
compiler.run((err, stat) => {
    stat.toJson();
})