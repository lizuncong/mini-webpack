const {
	Tapable,
    SyncHook
} = require("tapable");
const path = require('path')
const Chunk = require('./Chunk')
const MainTemplate = require("./MainTemplate");
const ChunkTemplate = require('./ChunkTemplate')
const Entrypoint = require('./Entrypoint')
const buildChunkGraph = require('./buildChunkGraph')
const createHash = require('./util/createHash')
const ModuleTemplate = require('./ModuleTemplate')
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
        this.outputOptions = this.options && this.options.output;
        this.mainTemplate = new MainTemplate(this.outputOptions);
		this.chunkTemplate = new ChunkTemplate(this.outputOptions);
        this.moduleTemplates = {
			javascript: new ModuleTemplate(this.runtimeTemplate, "javascript"),
		};
        // this.context = compiler.context
        this.inputFileSystem = compiler.inputFileSystem
        // this.outputFileSystem = compiler.outputFileSystem
        this.hooks = {
			beforeModuleIds: new SyncHook(["modules"]),
            beforeChunkIds: new SyncHook(["chunks"]),
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
        this.namedChunkGroups = new Map();
        this.chunkGroups = [];
		this.entrypoints = new Map();

        this.chunks = []

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
        for (const preparedEntrypoint of this._preparedEntrypoints) {
            const module = preparedEntrypoint.module;
            const name = preparedEntrypoint.name;
            const chunk = this.addChunk(name);
            // entrypoint即是一个chunk group，在webpack配置中配了几个入口点，就有几个
            // entrypoint对象
            const entrypoint = new Entrypoint(name);
            entrypoint.setRuntimeChunk(chunk)
            entrypoint.addOrigin(null, name, preparedEntrypoint.request);
            this.namedChunkGroups.set(name, entrypoint);
			this.entrypoints.set(name, entrypoint);
			this.chunkGroups.push(entrypoint);
            // 此时, entrypoint和chunk都只是根据name创建的一个空对象，还没和module关联。
            // 同时 entrypoint和chunk还没关联。

            // 下面两行代码相互关联chunk和entrypoint
            entrypoint.pushChunk(chunk)
            chunk.addGroup(entrypoint)
            // 下面两行代码相互管理chunk和module
            module.addChunk(chunk)
            chunk.addModule(module)
            chunk.entryModule = preparedEntrypoint.module;
			chunk.name = name;

            this.assignDepth(module);
        }

        buildChunkGraph(
            this,
            this.chunkGroups.slice()
        )

        this.hooks.beforeModuleIds.call(this.modules);
        this.hooks.beforeChunkIds.call(this.chunks);
        this.createHash();

        this.createChunkAssets();
    }
    addChunk(name){
        const chunk = new Chunk(name)
        this.chunks.push(chunk)
        return chunk;
    }
    assignDepth(module){
        let depth = 0;
        const queue = new Set([module]) 
        module.depth = 0;
        for (module of queue) {
			queue.delete(module);
			depth = module.depth;

			depth++;
			for(let i = 0; i < module.dependencies.length; i++){
                const dep = module.dependencies[i]
                if(dep.module){
                    queue.add(dep.module)
                    dep.module.depth = depth
                }
            }
		}
    }
    // module包含dependency，即dependency是module.dependencies
    // 数组中的每一项，这里会为module.dependencies中的每一个dependency
    // 创造一个引用
    getDependencyReference(module, dependency){
		return dependency.getReference();
    }
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
    createHash(){
        const outputOptions = this.outputOptions;
        const hashFunction = outputOptions.hashFunction; // md4;
		const hashDigest = outputOptions.hashDigest; // hex
		const hashDigestLength = outputOptions.hashDigestLength; // 20
        const hash = createHash(hashFunction);
        this.mainTemplate.updateHash(hash);
		this.chunkTemplate.updateHash(hash);
        this.moduleTemplates.javascript.updateHash(hash)

        // 为每个module生成hash及renderedHash值
        const modules = this.modules;
		for (let i = 0; i < modules.length; i++) {
			const module = modules[i];
			const moduleHash = createHash(hashFunction);
			module.updateHash(moduleHash);
			module.hash = moduleHash.digest(hashDigest);
			module.renderedHash = module.hash.substr(0, hashDigestLength);
		}

        // 生成chunk hash
        const chunks = this.chunks.slice();
        for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];
			const chunkHash = createHash(hashFunction);
			chunk.updateHash(chunkHash);
			chunk.hash = chunkHash.digest(hashDigest);
			// 上层的hash值
            hash.update(chunk.hash);
			chunk.renderedHash = chunk.hash.substr(0, hashDigestLength);
		}
        this.fullHash = hash.digest(hashDigest);
		this.hash = this.fullHash.substr(0, hashDigestLength);
    }
    createChunkAssets(){
        const outputOptions = this.outputOptions;
        for(let i = 0; i < this.chunks.length; i++){
            const chunk = this.chunks[i]
            chunk.files = []
            const template = this.mainTemplate;
            const manifest = template.getRenderManifest({
                chunk,
                hash: this.hash,
                fullHash: this.fullHash,
                outputOptions,
                moduleTemplates: this.moduleTemplates,
                dependencyTemplates: this.dependencyTemplates
            });
            console.log('manifest===', manifest)
        }
    }
    // emitAsset(file, source){
    //     this.assets[file] = source
    //     this.files.push(file)
    // }
}

module.exports = Compilation