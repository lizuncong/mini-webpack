// const webpack = require('webpack')
const webpack = require('./lib/webpack.js')
const options = require('../webpack.config')
options.context = process.cwd()


const compiler = webpack(options)
compiler.run((err, stat) => {
    // console.log('stat...', stat)
    // console.log(stat.toJson({
    //     entries: true,
    //     chunks: true,
    //     modules: true,
    //     assets: true
    // }))
})