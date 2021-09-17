// const webpack = require('./webpack-lib/index.js')
const webpack = require('webpack')
const options = require('./webpack.config')
debugger;

const compiler = webpack(options)
compiler.run((err, stat) => {
    console.log('stat...', stat)
    // console.log(stat.toJson({
    //     entries: true,
    //     chunks: true,
    //     modules: true,
    //     assets: true
    // }))
})