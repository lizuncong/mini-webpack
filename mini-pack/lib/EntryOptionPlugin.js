const SingleEntryPlugin  = require("./SingleEntryPlugin")

class EntryOptionPlugin{
    apply(compiler){
        compiler.hooks.entryOption.tap('EntryOptionPlugin', (context, entry)=>{
            console.log('entry option plugin call', context, entry)
            if(typeof entry === 'string'){
                new SingleEntryPlugin(context, entry,'main').apply(compiler)
            }
        })
    }
}

module.exports = EntryOptionPlugin