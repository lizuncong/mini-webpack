const path = require('path')

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    devtool: 'none',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: []
    },
    plugins: []
}