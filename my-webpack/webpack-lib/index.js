
const NodeEnvironmentPlugin = require('./plugins/NodeEnvironmentPlugin')
const Compiler = require('./Compiler')
const WebpackOptionsApply = require('./WebpackOptionsApply')
function webpack(options, callback){
    options.context = options.context || process.cwd();
    const compiler = new Compiler(options.context);
    compiler.options = options;
    new NodeEnvironmentPlugin().apply(compiler)
    options.plugins.forEach(plugin => {
        plugin.apply(compiler)
    });
    compiler.hooks.environment.call()
    compiler.hooks.afterEnvironment.call()
    new WebpackOptionsApply().process(options, compiler)
    return compiler
}

module.exports = webpack