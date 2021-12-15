
module.exports = class UnsafeCachePlugin {
	constructor(source, target) {
		this.source = source; // 当前钩子 resolve
		this.target = target; // 下一个钩子 'newResolve'
		this.cache = {}
	}

	apply(resolver) {
		const target = resolver.ensureHook(this.target);
		resolver
			.getHook(this.source)
			.tapAsync("UnsafeCachePlugin", (request, resolveContext, callback) => {
				const cacheEntry = this.cache[request.request]
				if(cacheEntry){
					return callback(null, cacheEntry)
				}
				// 如果缓存没有，则交由newResove钩子继续进行解析
				resolver.doResolve(
					target,
					request,
					resolveContext,
					(err, result) => {
						// TODO
					}
				)
			});
	}
};
