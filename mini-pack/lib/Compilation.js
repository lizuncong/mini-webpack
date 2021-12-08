const {
	Tapable,
	SyncHook,
	SyncBailHook,
	AsyncParallelHook,
	AsyncSeriesHook
} = require("tapable");
const path = require('path')
// const Chunk = require('./Chunk')
// const normalModuleFactory = require('./NormalModuleFactory')
// const ejs = require('ejs')
// const fs = require('fs')
// const tpl = fs.readFileSync(path.posix.join(__dirname, 'main.ejs'), 'utf8')
// const render = ejs.compile(tpl)
class Compilation extends Tapable {
    constructor(compiler){
        super();
        this.compiler = compiler
        this.options = compiler.options // webpack options
        this.context = compiler.context
        this.inputFileSystem = compiler.inputFileSystem
        this.outputFileSystem = compiler.outputFileSystem
        this.hooks = {
            addEntry: new SyncHook(['entry', 'name']),
            seal: new SyncHook([]),
            beforeChunks: new SyncHook([]),
            afterChunks: new SyncHook([])
        }
        this.dependencyFactories = new Map();

        // 代表我们的入口，里面放着所有的入口模块
        this.entries = []

        this.modules = [] // 这是一个模块的数组，里面都是模块实例
        this._modules = {} // 这是一个对象 key是模块的绝对路径，值是模块的实例
    
        this.chunks = []

        // this.files = []

        this.assets = {}
    }


    addEntry(context, entry, name, callback){
        this._addModuleChain(
            context, 
            entry,
            module => {
                // 将编译后的入口模块添加到入口数组中
                this.entries.push(module)
            },
            (err, module) => {
                callback();
                // callback(null, module)
            }
        )
    }

    _addModuleChain(context, entry, onModule, callback){
        console.log('addModuleChain..', context, entry)
        callback();
        return;
        // const module = normalModuleFactory.create({
        //     context: this.context, 
        //     name, // 所属的代码块的名字 main
        //     request: path.posix.join(context, entry) // 此模块的绝对路径
        // })
        // module.build(this)
        // // 把编译后的入口模块添加到入口数组
        // this.entries.push(module)
        normalModuleFactory.create(
            {
                contextInfo: {
                    issuer: "",
                    compiler: this.compiler.name
                },
                context,
                dependencies: [entry]
            },
            (err, module) => {
                if(err){
                    console.error(err)
                }
                onModule(module)
                module.build(this.options, this, this.inputFileSystem)
            }
        )
    }

    buildDependencies(module, dependencies){
        module.dependencies = dependencies.map(data => {
            const childModule = normalModuleFactory.create(data)
            return childModule.build(this)
        })
    }

    seal(callback){
        this.hooks.seal.call();
        this.hooks.beforeChunks.call()
        for(let entryModule of this.entries){
            const chunk = new Chunk(entryModule)
            this.chunks.push(chunk)
            // 只要模块的名字和代码的名字一样，就说明这个模块属于这个代码块
            chunk.modules = this.modules.filter(module => module.name === chunk.name)
        }
        this.hooks.afterChunks.call()
        this.createChunkAssets()
        callback()
    }
    createChunkAssets(){
        for(let i = 0; i < this.chunks.length; i++){
            const chunk = this.chunks[i]
            chunk.files = []
            const file = chunk.name + '.js' // main.js
            const source = render({
                entryId: chunk.entryModule.moduleId, // 此代码块的入口模块ID
                modules: chunk.modules
            })
            chunk.files.push(file)
            this.emitAsset(file, source)
        }
    }
    emitAsset(file, source){
        this.assets[file] = source
        this.files.push(file)
    }
}

module.exports = Compilation