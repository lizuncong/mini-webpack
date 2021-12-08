
class MyPlugin1 {
    constructor(){
        console.log('MyPlugin1  construct=====')
        debugger;
    }
    apply(compiler){
        console.log('Myplugin1 apply======')
        compiler.hooks.emit.tapPromise('MediaExtractPlugin', async (compilation) => {
            debugger;
        })
    }
}

module.exports = MyPlugin1