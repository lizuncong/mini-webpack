

 const path = require("path");
 const {
     Tapable,
 } = require("tapable");
 const RuleSet = require("./RuleSet");

 class NormalModuleFactory extends Tapable {
     constructor(context, resolverFactory, options) {
        super();
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
            }
        )
     }


     getResolver(type, resolveOptions) {
		return this.resolverFactory.get(
			type,
			resolveOptions || {}
		);
	}
 
 }
 
 module.exports = NormalModuleFactory;
 