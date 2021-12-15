const Tapable = require("tapable/lib/Tapable");
const SyncHook = require("tapable/lib/SyncHook");
const AsyncSeriesBailHook = require("tapable/lib/AsyncSeriesBailHook");
const AsyncSeriesHook = require("tapable/lib/AsyncSeriesHook");

function withName(name, hook) {
	hook.name = name;
	return hook;
}

class Resolver extends Tapable {
	constructor(fileSystem) {
		super();
        this.fileSystem = fileSystem;
        this.hooks = {
            resolve: withName(
				"resolve",
				new AsyncSeriesBailHook(["request", "resolveContext"])
			),
        }
	}
    // 通过该方法注册的钩子都是 异步串行保险式钩子
    ensureHook(name){
        const hook = this.hooks[name];
		if (!hook) {
			return (this.hooks[name] = withName(
				name,
				new AsyncSeriesBailHook(["request", "resolveContext"])
			));
		}
		return hook;
    }
    getHook(name){
        const hook = this.hooks[name];
		if (!hook) {
			throw new Error(`Hook ${name} doesn't exist`);
		}
		return hook;  
    }
    // 解析模块
	resolve(context, path, request, resolveContext, callback){
        return this.doResolve(
            this.hooks.resolve,
            {
                context: context,
			    path: path,
			    request: request
            },
            {},
            (err, result) => {
                // TODO
            }
        )
    }

    // request用于收集在解析过程中存储文件信息
    doResolve(hook, request, resolveContext, callback){
        const stackLine = `${hook.name}: (${request.path}) ${request.request}`
        const innerContext = {
            stack: resolveContext.stack ? resolveContext.stack.concat([stackLine]) : [stackLine]
        }
        // console.log('doResolve===', hook, request, innerContext, resolveContext)
        return hook.callAsync(request, innerContext, (err, result) => {
            // TODO
        })
    }

}

module.exports = Resolver;
