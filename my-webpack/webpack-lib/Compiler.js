const {
	Tapable,
	SyncHook,
	SyncBailHook,
	AsyncParallelHook,
	AsyncSeriesHook
} = require("tapable");
const Compilation = require('./Compilation')
const Stats = require('./Stats')
const mkdirp = require('mkdirp')
const path = require('path')
class Compiler extends Tapable {
    constructor(context){
        super();
        this.hooks = {
            environment: new SyncHook([]),
            afterEnvironment: new SyncHook([]),  
            afterPlugins: new SyncHook([]),   
            entryOption: new  SyncHook(['context', 'entry']),
            make: new AsyncParallelHook(['compilation']),
            beforeRun: new AsyncSeriesHook(['compiler']),  
            run: new AsyncSeriesHook(['compiler']),
            beforeCompile: new AsyncSeriesHook(['params']),
            compile: new SyncHook(['params']),   
            afterCompile: new AsyncSeriesHook(['params']),
            thisCompilation: new SyncHook(['compilation', 'params']),
            compilation: new SyncHook(['compilation', 'params']),
            emit: new AsyncSeriesHook(['compilation']),
            done: new AsyncSeriesHook(['stats'])
        }
        this.options = {}
        this.context = context
    }
    emitAssets(compilation, callback){
        const emitFiles = err => {
            // assets是一个对象，对象上有属性的值 { 文件名字， 值是源码}
            const assets = compilation.assets;
            for(let file in assets){
                const source = assets[file]
                const targetPath = path.posix.join(this.options.output.path, file)
                this.outputFileSystem.writeFileSync(targetPath, source)
            }
            callback()
        }
        this.hooks.emit.callAsync(compilation, (err) => {
            mkdirp(this.options.output.path, emitFiles);
        })
    }
    run(finallyCallback){
        const onCompiled = (err, compilation) => { // 编译完成后的回调
            this.emitAssets(compilation, (err) => {
                const stats = new Stats(compilation)
                this.hooks.done.callAsync(stats, err => {
                    return finallyCallback()
                })
            })
        }
        this.hooks.beforeRun.callAsync(this, err => {
            this.hooks.run.callAsync(this, err => {
                this.compile(onCompiled)
            })
        })
    }

    newCompilation(params){
        const compilation = new Compilation(this)
        this.hooks.thisCompilation.call(compilation, params)
        this.hooks.compilation.call(compilation, params)
        return compilation
    }


    compile(onCompiled){
        this.hooks.beforeCompile.callAsync({}, err => {
            this.hooks.compile.call()
            const compilation = this.newCompilation()
            this.hooks.make.callAsync(compilation, err => {
                compilation.seal(err => { // 通过模块生成代码块
                    this.hooks.afterCompile.callAsync(compilation, err => {
                        return onCompiled(err, compilation)  // 写入文件系统
                    })
                })
            })
        })
    }
}

module.exports = Compiler