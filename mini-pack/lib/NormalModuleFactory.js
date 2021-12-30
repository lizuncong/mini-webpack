

const path = require("path");
const {
    Tapable,
    SyncBailHook
} = require("tapable");
const RuleSet = require("./RuleSet");
const NormalModule = require('./NormalModule')

// 负责以下事情
// 1. 解析模块
// 2. 为模块匹配wepback loaders并执行
class NormalModuleFactory extends Tapable {
     constructor(context, resolverFactory, options) {
        super();
        this.hooks = {
            createParser: new SyncBailHook(["parserOptions"]),
            createGenerator: new SyncBailHook(["generatorOptions"])
        }
        this.context = context || "";
        // resolverFactory负责创建对应的moduleFactory实例
        this.resolverFactory = resolverFactory;
        this.ruleSet = new RuleSet(options.defaultRules.concat(options.rules));
     }
     create(data, callback){
		const dependencies = data.dependencies;
        const context = data.context || this.context;
        const resolveOptions = data.resolveOptions || {};
        const request = dependencies[0].request;
		const contextInfo = data.contextInfo || {};
        // 调用this.resolverFactory创建对应的resolver实例
        const normalResolver = this.getResolver("normal", data.resolveOptions);
        // normalResolver.resolve仅仅用于解析模块，获取文件路径等信息，而不是读取源码
        normalResolver.resolve(
            contextInfo,
            context,
            request,
            {},
            (err, resource, resourceResolveData) => {
                // resource, 文件的绝对路径，比如'/Users/lizc/Documents/MYProjects/mini-webpack/src/index.js'
                // resourceResolveData，包含文件的路径信息，以及package.json内容

                // 为模块 './src/index.js' 匹配对应的webpack loader
                const result = this.ruleSet.exec({
                    resource,
                    realResource: resource,
                    resourceQuery: "",
                    issuer: contextInfo.issuer,
					compiler: contextInfo.compiler
                })
                const useLoaders = [];
                for(const r of result){
                    if(r.type === 'use'){
                        useLoaders.push(r.value)
                    }
                }
                const parser = this.createParser();
                const generator = this.createGenerator();
                const data = {
                    context: context,
                    dependencies: dependencies,
                    generator: generator,
                    loaders: useLoaders, // webpack loaders数组
                    parser: parser,
                    rawRequest: request, // './src/index.js'
                    request: useLoaders // './src/index.js'
                        .map(l => l.loader)
                        .concat([resource])
                        .join("!"),
                    resolveOptions: {},
                    resource, // '/Users/lizc/Documents/MYProjects/mini-webpack/src/index.js'
                    userRequest: resource, // '/Users/lizc/Documents/MYProjects/mini-webpack/src/index.js'
                    resourceResolveData,
                    settings: {
                        resolve: {},
                        type: 'javascript/auto'
                    },
                    type: 'javascript/auto',
                } 
                // 为每一个文件创建一个对应的NormalModule实例
                const createdModule = new NormalModule(data);
                callback(null, createdModule);
            }
        )
    }
    createParser(parserOptions = {}) {
		const parser = this.hooks.createParser.call(parserOptions);
        return parser;
	}

    createGenerator() {
		const generator = this.hooks.createGenerator.call();
		return generator;
	}

     getResolver(type, resolveOptions) {
		return this.resolverFactory.get(
			type,
			resolveOptions || {}
		);
	}
 
 }
 
 module.exports = NormalModuleFactory;
 