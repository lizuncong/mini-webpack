
const CommonJsRequireDependency = require("./CommonJsRequireDependency");

class CommonJsPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(compiler) {
		compiler.hooks.compilation.tap(
			"CommonJsPlugin",
			(compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(
					CommonJsRequireDependency,
					normalModuleFactory
				);
			}
		);
	}
}
module.exports = CommonJsPlugin;
