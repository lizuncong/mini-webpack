const NodeEnvironmentPlugin = require('./node/NodeEnvironmentPlugin')
const WebpackOptionsApply = require('./WebpackOptionsApply')
const webpack = options => {
    let compiler;
    compiler = new Compiler(options.context);
	compiler.options = options;
    // 设置读写文件系统
    new NodeEnvironmentPlugin({
        infrastructureLogging: options.infrastructureLogging
    }).apply(compiler);
    for (const plugin of options.plugins) {
        plugin.apply(compiler); 
    }
    // 设置文件读写系统后，需要发布通知
    compiler.hooks.environment.call();
    compiler.hooks.afterEnvironment.call();
    compiler.options = new WebpackOptionsApply().process(options, compiler);
    return compiler
}

module.exports = webpack;