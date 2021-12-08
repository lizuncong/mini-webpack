const NodeEnvironmentPlugin = require('./node/NodeEnvironmentPlugin')
const Compiler = require('./Compiler')
const WebpackOptionsApply = require('./WebpackOptionsApply')
const WebpackOptionsDefaulter = require('./WebpackOptionsDefaulter')

const webpack = options => {
    // 处理webpack options默认值
    options = new WebpackOptionsDefaulter().process(options)
    const compiler = new Compiler(options.context);
    compiler.options = options;
    // 给comlier设置读写文件，日志输出属性值
    new NodeEnvironmentPlugin().apply(compiler)
    // 注册插件
    if(options.plugins && Array.isArray(options.plugins)){
        options.plugins.forEach(plugin => {
            plugin.apply(compiler)
        });
    }
    
    compiler.options = new WebpackOptionsApply().process(options, compiler)

    return compiler
}

module.exports = webpack;
