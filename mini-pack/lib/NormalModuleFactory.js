

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
        console.log('NormalModuleFactory constructor====')
     }
     create(data, callback){
        console.log('NormalModuleFactory.create====', data)
     }
 
 }
 
 module.exports = NormalModuleFactory;
 