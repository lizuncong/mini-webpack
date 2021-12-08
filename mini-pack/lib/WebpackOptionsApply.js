const EntryOptionPlugin = require('./EntryOptionPlugin')
class WebpackOptionsApply{
    process(options, compiler){
        compiler.outputPath = options.output.path;
		compiler.name = options.name;


        // JsonpTemplatePlugin = require("./web/JsonpTemplatePlugin");
        // FetchCompileWasmTemplatePlugin = require("./web/FetchCompileWasmTemplatePlugin");
        // NodeSourcePlugin = require("./node/NodeSourcePlugin");
        // new JsonpTemplatePlugin().apply(compiler);
        // new FetchCompileWasmTemplatePlugin({
        //     mangleImports: options.optimization.mangleWasmImports
        // }).apply(compiler);
        // new FunctionModulePlugin().apply(compiler);
        // new NodeSourcePlugin(options.node).apply(compiler);
        // new LoaderTargetPlugin(options.target).apply(compiler);
        // new JavascriptModulesPlugin().apply(compiler);
		// new JsonModulesPlugin().apply(compiler);
		// new WebAssemblyModulesPlugin({
		// 	mangleImports: options.optimization.mangleWasmImports
		// }).apply(compiler);

        // 挂载入口点，监听make事件
        new EntryOptionPlugin().apply(compiler)
        compiler.hooks.entryOption.call(options.context, options.entry)
    
        
        // compiler.hooks.afterPlugins.call(compiler);
        return options;
    }
}

module.exports = WebpackOptionsApply

