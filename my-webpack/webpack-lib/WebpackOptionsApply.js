const EntryOptionPlugin = require('./plugins/EntryOptionPlugin')
class WebpackOptionsApply{
    process(options, compiler){
        compiler.hooks.afterPlugins.call(compiler);
        // 挂载入口点，监听make事件
        new EntryOptionPlugin().apply(compiler)
        compiler.hooks.entryOption.call(options.context, options.entry)
    }
}

module.exports = WebpackOptionsApply