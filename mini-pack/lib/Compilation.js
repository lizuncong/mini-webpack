const {
	Tapable,
} = require("tapable");
const path = require('path')
const Chunk = require('./Chunk')
// const normalModuleFactory = require('./NormalModuleFactory')
// const ejs = require('ejs')
// const fs = require('fs')
// const tpl = fs.readFileSync(path.posix.join(__dirname, 'main.ejs'), 'utf8')
// const render = ejs.compile(tpl)
class Compilation extends Tapable {
    constructor(compiler){
        super();
        this.compiler = compiler
        this.resolverFactory = compiler.resolverFactory;
        this.options = compiler.options // webpack options
        // this.context = compiler.context
        this.inputFileSystem = compiler.inputFileSystem
        // this.outputFileSystem = compiler.outputFileSystem
        this.hooks = {
            // addEntry: new SyncHook(['entry', 'name']),
            // seal: new SyncHook([]),
            // beforeChunks: new SyncHook([]),
            // afterChunks: new SyncHook([])
        }
        this.dependencyFactories = new Map();
		this._preparedEntrypoints = [];

        // 代表我们的入口，里面放着所有的入口模块
        this.entries = []

        this.modules = [] // 这是一个模块的数组，里面都是模块实例
		this._modules = new Map(); // 存储的是已经编译过的模块实例
    
        // this.chunks = []

        // this.files = []

        // this.assets = {}
    }


    addEntry(context, entry, name, callback){
        const slot = {
			name: name,
			request: entry.request,
			module: null
		};
        this._preparedEntrypoints.push(slot)
        this._addModuleChain(
            context, 
            entry,
            module => {
                // 将编译后的入口模块添加到入口数组中
                this.entries.push(module)
            },
            (err, module) => {
                slot.module = module;
                callback(null, module)
            }
        )
    }

    _addModuleChain(context, dependency, onModule, callback){
        const Dep = dependency.constructor
        const moduleFactory = this.dependencyFactories.get(Dep)
        moduleFactory.create(
            {
                contextInfo: {
                    issuer: "",
                    compiler: this.compiler.name
                },
                context,
                dependencies: [dependency]
            },
            (err, module) => {
                const addModuleResult = this.addModule(module)
                onModule(module)
                dependency.module = module
                if(addModuleResult.build){
                    this.buildModule(module, false, null, null, err => {
                        if (addModuleResult.dependencies) {
							this.processModuleDependencies(module, err => {
								if (err) return callback(err);
								callback(null, module);
							});
						} else {
							return callback(null, module);
						}
                    })
                }
            }
        )
    }
    addModule(module){
        const identifier = module.identifier();
        // 判断模块是否已经编译过
        const alreadyAddedModule = this._modules.get(identifier);
		if (alreadyAddedModule) {
			return {
				module: alreadyAddedModule,
				issuer: false,
				build: false,
				dependencies: false
			};
		}
        this._modules.set(identifier, module);
        this.modules.push(module)
        return {
			module: module,
			issuer: true,
			build: true,
			dependencies: true
		};
    }
    buildModule(module, optional, origin, dependencies, thisCallback) {
        module.build(
            this.options,
            this,
            this.resolverFactory.get("normal", module.resolveOptions),
            this.inputFileSystem,
            error => {
                thisCallback();
            }
        )
	}
    processModuleDependencies(module, callback){
        const sortedDependencies = [];
        module.dependencies.forEach(dep => {
            const factory = this.dependencyFactories.get(dep.constructor)
            sortedDependencies.push({
                factory,
                dependencies: [dep]
            })
        })
        this.addModuleDependencies(module, sortedDependencies, callback)
    }

    addModuleDependencies(module, dependencies, callback){
        if(!dependencies.length) callback()
        let count = 0;
        // console.log('addModuleDependencies==', dependencies)
        dependencies.forEach(item => {
            const dependencies = item.dependencies;
            const factory = item.factory
            factory.create(
                {
                    contextInfo: {
                        issuer: undefined,
                        compiler: this.compiler.name
                    },
                    resolveOptions: module.resolveOptions,
                    context: module.context,
                    dependencies: dependencies
                },
                (err, dependentModule) => {
                    const addModuleResult = this.addModule(dependentModule);
                    for (let index = 0; index < dependencies.length; index++) {
                        const dep = dependencies[index];
                        dep.module = dependentModule;
                    }
                    if (addModuleResult.build) {
                        this.buildModule(
                            dependentModule,
                            false,
                            null,
                            null,
                            err => {
                                count++;
                                if(addModuleResult.dependencies){
                                    this.processModuleDependencies(dependentModule, err => {
                                        if(count === dependencies.length){
                                            callback()
                                        }
                                    });
                                } else {
                                    if(count === dependencies.length){
                                        callback()
                                    }
                                }
                            }
                        )
                    }
                }
            )
        })
    }
    finish(callback){
        callback();
    }
    seal(callback){
        console.log('seal==', this._preparedEntrypoints)
    }
    // seal(callback){
    //     this.hooks.seal.call();
    //     this.hooks.beforeChunks.call()
    //     for(let entryModule of this.entries){
    //         const chunk = new Chunk(entryModule)
    //         this.chunks.push(chunk)
    //         // 只要模块的名字和代码的名字一样，就说明这个模块属于这个代码块
    //         chunk.modules = this.modules.filter(module => module.name === chunk.name)
    //     }
    //     this.hooks.afterChunks.call()
    //     this.createChunkAssets()
    //     callback()
    // }
    // buildDependencies(module, dependencies){
    //     module.dependencies = dependencies.map(data => {
    //         const childModule = normalModuleFactory.create(data)
    //         return childModule.build(this)
    //     })
    // }

    // seal(callback){
    //     this.hooks.seal.call();
    //     this.hooks.beforeChunks.call()
    //     for(let entryModule of this.entries){
    //         const chunk = new Chunk(entryModule)
    //         this.chunks.push(chunk)
    //         // 只要模块的名字和代码的名字一样，就说明这个模块属于这个代码块
    //         chunk.modules = this.modules.filter(module => module.name === chunk.name)
    //     }
    //     this.hooks.afterChunks.call()
    //     this.createChunkAssets()
    //     callback()
    // }
    // createChunkAssets(){
    //     for(let i = 0; i < this.chunks.length; i++){
    //         const chunk = this.chunks[i]
    //         chunk.files = []
    //         const file = chunk.name + '.js' // main.js
    //         const source = render({
    //             entryId: chunk.entryModule.moduleId, // 此代码块的入口模块ID
    //             modules: chunk.modules
    //         })
    //         chunk.files.push(file)
    //         this.emitAsset(file, source)
    //     }
    // }
    // emitAsset(file, source){
    //     this.assets[file] = source
    //     this.files.push(file)
    // }
}

module.exports = Compilation