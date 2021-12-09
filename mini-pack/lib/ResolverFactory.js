const { 
     Tapable
} = require("tapable");

 
 module.exports = class ResolverFactory extends Tapable {
     constructor() {
         super();
         console.log('ResolverFactory.constructor====')
     }

 };
 