
module.exports = class ParsePlugin {
	constructor(source, target) {
		this.source = source; // newResolve 钩子 
		this.target = target; // parsedResolve 钩子
	}

	apply(resolver) {
		const target = resolver.ensureHook(this.target);
		resolver
			.getHook(this.source)
			.tapAsync("ParsePlugin", (request, resolveContext, callback) => {
				// 解析request.request文件路径，判断是否是目录、文件或者模块。
				const parsed = {
					directory: false,
					file: false,
					module: false,
					query: '',
					request: request.request
				}
				const obj = Object.assign({}, request, parsed)
				resolver.doResolve(target, obj, resolveContext, callback)
			});
	}
};
