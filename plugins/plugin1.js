
class MyPlugin1 {
    constructor(){
        console.log('MyPlugin1  construct=====')
    }
    apply(compiler){
        console.log('Myplugin1 apply======')
        compiler.hooks.emit.tapPromise('MediaExtractPlugin', async (compilation) => {
            console.log();
        })
    }
}

module.exports = MyPlugin1