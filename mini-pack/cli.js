const webpack = require('./lib/webpack.js')
const options = require('../webpack.config')

const compiler = webpack(options)
compiler.run((err, stat) => {
    stat.toJson();
})