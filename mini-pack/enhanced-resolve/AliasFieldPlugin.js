const path = require('path')
module.exports = class AliasFieldPlugin {
	constructor(source, field, target) {
		this.source = source;
		this.field = field;
		this.target = target;
	}

	apply(resolver) {
		const target = resolver.ensureHook(this.target);
		resolver
			.getHook(this.source)
			.tapAsync("AliasFieldPlugin", (request, resolveContext, callback) => {
				request.__innerRequest_request = request.request;
				request.__innerRequest_relativePath = request.relativePath;
				request.__innerRequest = resolver.join(request.relativePath, request.request)
				callback();
			});
	}
};
