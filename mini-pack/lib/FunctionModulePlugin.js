
const FunctionModuleTemplatePlugin = require("./FunctionModuleTemplatePlugin");

class FunctionModulePlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap("FunctionModulePlugin", compilation => {
			new FunctionModuleTemplatePlugin().apply(
				compilation.moduleTemplates.javascript
			);
		});
	}
}

module.exports = FunctionModulePlugin;
