class AsyncPlugin{
    apply(compiler){
        compiler.hooks.emit.tapAsync('AsyncPlugin', function(compilation, cb){
            setTimeout(() => {
                console.log('发射文件')
                cb()
            }, 1000)
        })

        compiler.hooks.emit.tapPromise('AsyncPlugin', (compilation) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('再等一秒')
                    resolve()
                }, 1000)
            })
        })
    }
}

module.exports = AsyncPlugin