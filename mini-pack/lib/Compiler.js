const {
	Tapable,
	SyncHook,
	SyncBailHook,
	AsyncParallelHook,
	AsyncSeriesHook
} = require("tapable");
const ResolverFactory = require("./ResolverFactory");
const NormalModuleFactory = require('./NormalModuleFactory')
const Compilation = require('./Compilation')
const Stats = require('./Stats')
const path = require('path')
class Compiler extends Tapable {
    constructor(context){
        super();
        // 这些钩子大部分在WebpackOptionsApply实例中注册插件
        this.hooks = {
            afterCompile: new AsyncSeriesHook(["compilation"]),
			afterResolvers: new SyncHook(["compiler"]),
			beforeRun: new AsyncSeriesHook(["compiler"]),
			run: new AsyncSeriesHook(["compiler"]),
			watchRun: new AsyncSeriesHook(["compiler"]),
			thisCompilation: new SyncHook(["compilation", "params"]),
			entryOption: new SyncBailHook(["context", "entry"]),
			make: new AsyncParallelHook(["compilation"]),
			compilation: new SyncHook(["compilation", "params"]),
			emit: new AsyncSeriesHook(["compilation"]),
        }
        this.name = undefined;
        
        // 用于创建resolver实例
        this.resolverFactory = new ResolverFactory();
        this.outputPath = "";
        this.outputFileSystem = null;
		this.inputFileSystem = null;
        this.options = {} // webpack options
        this.context = context
    }
    emitAssets(compilation, callback){
        let outputPath;
        const emitFiles = err => {
            const assets = compilation.getAssets()
            for(const { name: targetFile, source } of assets){
                const targetPath = path.posix.join(outputPath, targetFile)
                let content = source.source();
                this.outputFileSystem.writeFileSync(targetPath, content)
            }
            callback()
        }
        this.hooks.emit.callAsync(compilation, (err) => {
            // 在简单的主流程中，其实outputPath可以直接赋值this.outputPath
            outputPath = compilation.getPath(this.outputPath);
            this.outputFileSystem.mkdir(outputPath, emitFiles);
        })
    }
    
    run(finalCallback){
        const onCompiled = (err, compilation) => { // 编译完成后的回调
            this.emitAssets(compilation, (err) => {
                const stats = new Stats(compilation)
                finalCallback(null, stats)
            })
        }
        this.compile(onCompiled)
    }

    newCompilation(params){
        const compilation = new Compilation(this)
        this.hooks.thisCompilation.call(compilation, params)
        // 主要是为compilation.dependencyFactories设置值以及
        // normalModuleFactory.hooks注册钩子
        // 触发SingleEntryPlugin中注册的插件执行，从而为compilation.dependencyFactories
        // 设置对应的params.normalModuleFactory值
        this.hooks.compilation.call(compilation, params)
        return compilation
    }


    compile(onCompiled){
        const params = {
            // normalModuleFactory负责调用compiler.resolverFactory.create方法创建
            // enhanced-resolver实例。normalModuleFactory也是负责解析模块的工厂实例
            normalModuleFactory: new NormalModuleFactory(
                this.options.context,
                this.resolverFactory,
                this.options.module || {}
            ),
        }
        const compilation = this.newCompilation(params)
        // 创建完compilation后，触发compilation的addEntry方法。
        // SingleEntryPlugin 监听了make事件，触发compilation.addEntry方法
        this.hooks.make.callAsync(compilation, err => {
            compilation.finish(err => {
                compilation.seal(err => { // 通过模块生成代码块
                    onCompiled(err, compilation)
                })
            })
        })
    }
}

module.exports = Compiler