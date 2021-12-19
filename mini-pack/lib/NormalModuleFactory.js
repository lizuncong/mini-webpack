

const path = require("path");
const {
    Tapable,
    SyncBailHook
} = require("tapable");
const RuleSet = require("./RuleSet");
const NormalModule = require('./NormalModule')
class NormalModuleFactory extends Tapable {
     constructor(context, resolverFactory, options) {
        super();
        this.hooks = {
            createParser: new SyncBailHook(["parserOptions"]),
            createGenerator: new SyncBailHook(["generatorOptions"])
        }
        this.context = context || "";
        this.resolverFactory = resolverFactory;
        this.ruleSet = new RuleSet(options.defaultRules.concat(options.rules));
     }
     create(data, callback){
		const dependencies = data.dependencies;
        const context = data.context || this.context;
        const resolveOptions = data.resolveOptions || {};
        const request = dependencies[0].request;
		const contextInfo = data.contextInfo || {};
        const normalResolver = this.getResolver("normal", data.resolveOptions);
        // 解析模块，获取文件绝对路径
        normalResolver.resolve(
            contextInfo,
            context,
            request,
            {},
            (err, resource, resourceResolveData) => {
                // 提取模块 './src/index.js' 对应的webpack loader
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
                    loaders: useLoaders,
                    parser: parser,
                    rawRequest: request,
                    request: useLoaders
                        .map(l => l.loader)
                        .concat([resource])
                        .join("!"),
                    resolveOptions: {},
                    resource,
                    userRequest: resource,
                    resourceResolveData,
                    settings: {
                        resolve: {},
                        type: 'javascript/auto'
                    },
                    type: 'javascript/auto',
                } 
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
 