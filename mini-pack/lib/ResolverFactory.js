const { 
     Tapable,
     SyncWaterfallHook
} = require("tapable");

 
 module.exports = class ResolverFactory extends Tapable {
     constructor() {
         super();
         this.hooks = {
			resolveOptions: new HookMap(
				() => new SyncWaterfallHook(["resolveOptions"])
			),
		};
         this.cache2 = new Map();
     }

     get(type, resolveOptions = {}){
		const ident = `${type}|${JSON.stringify(resolveOptions)}`;
        const resolver = this.cache2.get(ident);
		if (resolver) return resolver;
        const newResolver = this._create(type, resolveOptions);
		this.cache2.set(ident, newResolver);
		return newResolver;
     }
     _create(type, resolveOptions){
        const hook = this.hooks.resolveOptions.for(type);
		resolveOptions = hook.call(resolveOptions);
     }
 };
 