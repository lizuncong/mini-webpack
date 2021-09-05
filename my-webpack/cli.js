const webpack = require('./webpack-lib/index.js')
const options = require('./webpack.config')
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