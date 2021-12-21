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
// const Stats = require('./Stats')
// const mkdirp = require('mkdirp')
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

        this.resolverFactory = new ResolverFactory();
        this.outputPath = "";
        this.outputFileSystem = null;
		this.inputFileSystem = null;
        this.options = {} // webpack options
        this.context = context
    }
    // emitAssets(compilation, callback){
    //     const emitFiles = err => {
    //         // assets是一个对象，对象上有属性的值 { 文件名字， 值是源码}
    //         const assets = compilation.assets;
    //         for(let file in assets){
    //             const source = assets[file]
    //             const targetPath = path.posix.join(this.options.output.path, file)
    //             this.outputFileSystem.writeFileSync(targetPath, source)
    //         }
    //         callback()
    //     }
    //     this.hooks.emit.callAsync(compilation, (err) => {
    //         mkdirp(this.options.output.path, emitFiles);
    //     })
    // }
    
    run(finalCallback){
        const onCompiled = (err, compilation) => { // 编译完成后的回调
            finalCallback();
            return;
            this.emitAssets(compilation, (err) => {
                const stats = new Stats(compilation)
                finalCallback(null, stats)
            })
        }
        this.compile(onCompiled)
    }

    newCompilation(params){
        const compilation = new Compilation(this)
        // this.hooks.thisCompilation.call(compilation, params)
        this.hooks.compilation.call(compilation, params)
        return compilation
    }


    compile(onCompiled){
        const params = {
            normalModuleFactory: new NormalModuleFactory(
                this.options.context,
                this.resolverFactory,
                this.options.module || {}
            ),
			// contextModuleFactory: this.createContextModuleFactory(),
			// compilationDependencies: new Set()
        }
        const compilation = this.newCompilation(params)
        // 创建完compilation后，触发compilation的addEntry方法。
        // SingleEntryPlugin 监听了make事件，触发compilation.addEntry方法
        this.hooks.make.callAsync(compilation, err => {
            compilation.finish(err => {
                compilation.seal(err => { // 通过模块生成代码块
                    // onCompiled(err, compilation)
                })
            })
        })
    }
}

module.exports = Compiler