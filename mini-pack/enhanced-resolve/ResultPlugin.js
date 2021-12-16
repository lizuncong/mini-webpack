
module.exports = class ResultPlugin {
	constructor(source) {
		this.source = source;
	}

	apply(resolver) {
		this.source.tapAsync(
			"ResultPlugin",
			(request, resolverContext, callback) => {
				const obj = Object.assign({}, request);
				callback(null, obj);
			}
		);
	}
};
