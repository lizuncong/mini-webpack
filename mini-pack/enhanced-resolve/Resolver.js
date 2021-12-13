const Tapable = require("tapable/lib/Tapable");
const SyncHook = require("tapable/lib/SyncHook");
const AsyncSeriesBailHook = require("tapable/lib/AsyncSeriesBailHook");
const AsyncSeriesHook = require("tapable/lib/AsyncSeriesHook");

class Resolver extends Tapable {
	constructor(fileSystem) {
		super();
        this.fileSystem = fileSystem;
	}

    // 解析模块
	resolve(context, path, request, resolveContext, callback){
        console.log(
            'Resolver.resolve======',
            context,
            path,
            request,
            resolveContext
        )
        return this.doResolve(
            this.UnsafeCachePlugin,
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

    doResolve(hook, request, resolveContext, callback){
        console.log('doResolve===', hook, request, resolveContext)
    }

    UnsafeCachePlugin(){

    }


}

module.exports = Resolver;
