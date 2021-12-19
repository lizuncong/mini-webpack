
const Parser = require('./Parser')
const JavascriptGenerator = require('./JavascriptGenerator')
class JavascriptModulesPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap(
			"JavascriptModulesPlugin",
			(compilation, { normalModuleFactory }) => {
				normalModuleFactory.hooks.createParser
				.tap("JavascriptModulesPlugin", options => {
					return new Parser(options, "auto");
				})
				normalModuleFactory.hooks.createGenerator
				.tap("JavascriptModulesPlugin", () => {
					return new JavascriptGenerator();
				});
			}
		);
	}
}

module.exports = JavascriptModulesPlugin;
