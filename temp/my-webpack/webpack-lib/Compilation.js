const {
	Tapable,
	SyncHook,
	SyncBailHook,
	AsyncParallelHook,
	AsyncSeriesHook
} = require("tapable");
const path = require('path')
const Chunk = require('./Chunk')
const normalModuleFactory = require('./NormalModuleFactory')
const ejs = require('ejs')
const fs = require('fs')
const tpl = fs.readFileSync(path.posix.join(__dirname, 'main.ejs'), 'utf8')
const render = ejs.compile(tpl)
class Compilation extends Tapable {
    constructor(compiler){
        super();
        this.compiler = compiler
        this.options = compiler.options
        this.context = compiler.context
        this.inputFileSystem = compiler.inputFileSystem
        this.outputFileSystem = compiler.outputFileSystem
        this.hooks = {
            addEntry: new SyncHook(['entry', 'name']),
            seal: new SyncHook([]),
            beforeChunks: new SyncHook([]),
            afterChunks: new SyncHook([])
        }
        // 代表我们的入口，里面放着所有的入口模块
        this.entries = []

        this.modules = [] // 这是一个模块的数组，里面都是模块实例
        this._modules = {} // 这是一个对象 key是模块的绝对路径，值是模块的实例
    
        this.chunks = []

        this.files = []

        this.assets = {}
    }

    // context: '/Users/lizuncong/Documents/手写源码系列/mini-webpack'
    // entry: 
    // { module:null
    // optional:false
    // request:'./src/index.js'
    // type (get):ƒ type() {\n\t\treturn "single entry";\n\t}
    // userRequest:'./src/index.js'
    // __proto__:ModuleDependency
    // weak:false
    // }
    // name: main
    addEntry(context, entry, name, finallyCallback){
        this._addModuleChain(context, entry, name);
        finallyCallback()
    }

    _addModuleChain(context, entry, name){
        const module = normalModuleFactory.create({
            context: this.context, 
            name, // 所属的代码块的名字 main
            request: path.posix.join(context, entry) // 此模块的绝对路径
        })
        module.build(this)
        // 把编译后的入口模块添加到入口数组
        this.entries.push(module)
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