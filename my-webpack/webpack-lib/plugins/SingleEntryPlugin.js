class SingleEntryPlugin{
    constructor(context, entry, name){
        this.context = context;
        this.entry = entry
        this.name = name
    }
    apply(compiler){
        console.log('single')
        compiler.hooks.make.tapAsync('SingleEntryPlugin', (compilation, callback) => {
            const { context, entry, name } = this;
            // 开始从入口文件进行递归编译
            compilation.addEntry(context, entry, name, callback)
        })
    }
}

module.exports = SingleEntryPlugin