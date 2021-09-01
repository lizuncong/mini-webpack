class DonePlugin{
    apply(compiler){
        compiler.hooks.done.tap('Done', function(stats){
            console.log('编译完成...')
        })
    }
}

module.exports = DonePlugin