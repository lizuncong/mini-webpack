const Resolver = require("./Resolver");

exports.createResolver = function(options) {

	const fileSystem = options.fileSystem;
    const resolver = new Resolver(fileSystem)
	return resolver;
};

