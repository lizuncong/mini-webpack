class P {
    apply(compiler){
        compiler.hooks.emit.tap('emit', function(){
            console.log('my plugin emit')
        })
    }
}

module.exports = P;