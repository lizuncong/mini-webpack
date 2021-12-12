

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
        console.log('NormalModuleFactory constructor====', this.ruleSet)
     }
     create(data, callback){
		const dependencies = data.dependencies;
        const context = data.context || this.context;
        const resolveOptions = data.resolveOptions || {};
        const request = dependencies[0].request;
		const contextInfo = data.contextInfo || {};
        console.log('NormalModuleFactory.create====', data)
     }
 
 }
 
 module.exports = NormalModuleFactory;
 