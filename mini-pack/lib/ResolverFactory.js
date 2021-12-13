const { 
     Tapable,
     SyncWaterfallHook,
     HookMap
} = require("tapable");
const Factory = require("../enhanced-resolve/ResolverFactory");

 
 module.exports = class ResolverFactory extends Tapable {
     constructor() {
         super();
         this.hooks = {
			resolveOptions: new HookMap(
				() => new SyncWaterfallHook(["resolveOptions"])
			),
		};
     }

     get(type, resolveOptions = {}){
        const newResolver = this._create(type, resolveOptions);
		return newResolver;
     }
     _create(type, resolveOptions){
        const hook = this.hooks.resolveOptions.for(type);
		resolveOptions = hook.call(resolveOptions);
        const resolver = Factory.createResolver(resolveOptions)
        resolver.withOptions = options => {
            return resolver
        }
        return resolver
    }
 };
 