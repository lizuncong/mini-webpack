const EntryOptionPlugin = require('./EntryOptionPlugin')
const JavascriptModulesPlugin = require('./JavascriptModulesPlugin')
const CommonJsPlugin = require("./dependencies/CommonJsPlugin");
const NamedModulesPlugin = require('./NamedModulesPlugin')
const NamedChunksPlugin = require('./NamedChunksPlugin')
const FunctionModulePlugin = require('./FunctionModulePlugin')
const TemplatedPathPlugin = require("./TemplatedPathPlugin");

// 在webpack.js中初始化
class WebpackOptionsApply{
    process(options, compiler){
        compiler.outputPath = options.output.path;
		compiler.name = options.name;


        const JsonpTemplatePlugin = require("./web/JsonpTemplatePlugin");
        new JsonpTemplatePlugin().apply(compiler);
        new FunctionModulePlugin().apply(compiler);
        new TemplatedPathPlugin().apply(compiler);
        
        new JavascriptModulesPlugin().apply(compiler);

        // 挂载入口点，注册compiler.hooks.entryOption插件
        new EntryOptionPlugin().apply(compiler)
        // 触发插件执行，此时初始化SingleEntryPlugin初始化并注册插件，
        // 监听compiler.hooks.make钩子
        compiler.hooks.entryOption.call(options.context, options.entry)
        
        
        
        new CommonJsPlugin(options.module).apply(compiler);
        new NamedModulesPlugin().apply(compiler);
        new NamedChunksPlugin().apply(compiler)
      
        
        // compiler.resolverFactory主要用于创建解析文件的resolver实例
        // 创建resolver实例时需要传递options选项，这里就是用钩子注册
        // 创建resolver实例需要的选项
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
        
        return options;
    }
}

module.exports = WebpackOptionsApply

