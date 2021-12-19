const EntryOptionPlugin = require('./EntryOptionPlugin')
const JavascriptModulesPlugin = require('./JavascriptModulesPlugin')
const CommonJsPlugin = require("./dependencies/CommonJsPlugin");

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
        new JavascriptModulesPlugin().apply(compiler);
		// new JsonModulesPlugin().apply(compiler);
		// new WebAssemblyModulesPlugin({
		// 	mangleImports: options.optimization.mangleWasmImports
		// }).apply(compiler);

        // 挂载入口点，监听make事件
        new EntryOptionPlugin().apply(compiler)
        new CommonJsPlugin(options.module).apply(compiler);
        compiler.hooks.entryOption.call(options.context, options.entry)
        
        compiler.resolverFactory.hooks.resolveOptions
        .for("loader")
        .tap("WebpackOptionsApply", resolveOptions => {
            return Object.assign(
                {
                    fileSystem: compiler.inputFileSystem
                },
                options.resolveLoader,
                resolveOptions
            );
        });
        compiler.resolverFactory.hooks.resolveOptions
        .for("normal")
        .tap("WebpackOptionsApply", resolveOptions => {
            return Object.assign(
                {
                    fileSystem: compiler.inputFileSystem
                },
                options.resolve,
                resolveOptions
            );
        });
        
        // compiler.hooks.afterPlugins.call(compiler);
        return options;
    }
}

module.exports = WebpackOptionsApply

