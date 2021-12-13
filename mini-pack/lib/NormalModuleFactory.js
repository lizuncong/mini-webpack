

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
        normalResolver.resolve(
            contextInfo,
            context,
            request,
            {},
            (err, resource, resourceResolveData) => {

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
 