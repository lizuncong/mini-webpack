const path = require('path')

module.exports = {
    context: process.cwd(),
    mode: 'development',
    entry: './src/index.js',
    devtool: 'none',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: []
    },
    plugins: []
}