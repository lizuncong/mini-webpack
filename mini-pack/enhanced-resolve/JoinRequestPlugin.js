
const path = require('path')
module.exports = class JoinRequestPlugin {
	constructor(source, target) {
		this.source = source;
		this.target = target;
	}

	apply(resolver) {
		const target = resolver.ensureHook(this.target);
		resolver
			.getHook(this.source)
			.tapAsync("JoinRequestPlugin", (request, resolveContext, callback) => {
				console.log('JoinRequestPlugin==', path.join(request.path, request.request))
				const obj = Object.assign({}, request, {
					// webpack使用的是resolver.join，其实就是memory-fs/lib下的join方法
					path: path.join(request.path, request.request),
					relativePath: request.request,
					// relativePath:
					// 	request.relativePath &&
					// 	path.join(request.relativePath, request.request),
					request: undefined
				});
				resolver.doResolve(target, obj, resolveContext, callback);
			});
	}
};
