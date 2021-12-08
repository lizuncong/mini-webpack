

 const path = require("path");
 const {
     Tapable,
 } = require("tapable");
 
 class NormalModuleFactory extends Tapable {
     constructor(context, resolverFactory, options) {
        super();
        console.log('NormalModuleFactory====', context, resolverFactory, options)
     }
 
 }
 
 module.exports = NormalModuleFactory;
 