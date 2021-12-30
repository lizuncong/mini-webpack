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
            // 在WebpackOptionsApply.js中注册resolveOptions插件
			resolveOptions: new HookMap(
				() => new SyncWaterfallHook(["resolveOptions"])
			),
		};
     }

     get(type, resolveOptions = {}){
        const newResolver = this._create(type, resolveOptions);
		return newResolver;
     }
     // 根据type创建对应的resolver实例.
     // 在webpack中，解析模块，比如require('./test.js')，查找test.js的路径
     // 使用的就是enhanced-resolver实例。webpack支持解析不同的文件类型
     // 使用不同的resolveOptions选项，目前支持的type有 “loader” 和 “normal”
     _create(type, resolveOptions){
        // 触发在WebpackOptionsApply.js中注册的resolveOptions插件执行
        const hook = this.hooks.resolveOptions.for(type);
		resolveOptions = hook.call(resolveOptions);
        const resolver = Factory.createResolver(resolveOptions)
        resolver.withOptions = options => {
            return resolver
        }
        return resolver
    }
 };
 