
class Index {
    constructor(){
        debugger;
    }
    apply(compiler){
        compiler.hooks.emit.tapPromise('MediaExtractPlugin', async (compilation) => {
            debugger;
        })
    }
}

module.exports = Index