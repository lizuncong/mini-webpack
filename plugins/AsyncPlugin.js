class AsyncPlugin{
    apply(compiler){
        compiler.hooks.emit.tapAsync('AsyncPlugin', function(compilation, cb){
            setTimeout(() => {
                console.log('发射文件')
                cb()
            }, 1000)
        })
    }
}

module.exports = AsyncPlugin