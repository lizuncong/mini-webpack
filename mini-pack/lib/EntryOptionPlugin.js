const SingleEntryPlugin  = require("./SingleEntryPlugin")

// 在WebpackOptionsApply.js中初始化
// webpack可以打包多页和单页应用，通过在webpack.config中配置entry
// EntryOptionPlugin主要是处理webpack.config中的entry配置，
// 然后为每个entry初始化一个SingleEntryPlugin实例
class EntryOptionPlugin{
    apply(compiler){
        compiler.hooks.entryOption.tap('EntryOptionPlugin', (context, entry)=>{
            if(typeof entry === 'string'){
                new SingleEntryPlugin(context, entry,'main').apply(compiler)
            }
        })
    }
}

module.exports = EntryOptionPlugin