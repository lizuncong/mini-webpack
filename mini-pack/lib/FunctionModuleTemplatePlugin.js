
const ConcatSource = require('../webpack-sources/ConcatSource')
const Template = require("./Template");

class FunctionModuleTemplatePlugin {
	apply(moduleTemplate) {
		moduleTemplate.hooks.render.tap(
			"FunctionModuleTemplatePlugin",
			(moduleSource, module) => {
				const source = new ConcatSource();
				const args = ['module', 'exports'];
				if(module.dependencies.length){
					args.push("__webpack_require__");
				}
				source.add("/***/ (function(" + args.join(", ") + ") {\n\n");
				source.add(moduleSource);
				source.add("\n\n/***/ })");
				return source;
			}
		);
		moduleTemplate.hooks.package.tap(
			"FunctionModuleTemplatePlugin",
			(moduleSource, module) => {
				const source = new ConcatSource();
				const req = module.id;
				const reqStr = req.replace(/\*\//g, "*_/");
				const reqStrStar = "*".repeat(reqStr.length);
				source.add("/*!****" + reqStrStar + "****!*\\\n");
				source.add("  !*** " + reqStr + " ***!\n");
				source.add("  \\****" + reqStrStar + "****/\n");
				source.add(Template.toComment("no static exports found") + "\n");
				source.add(moduleSource);
				return source;
			}
		);
		moduleTemplate.hooks.hash.tap("FunctionModuleTemplatePlugin", hash => {
			hash.update("FunctionModuleTemplatePlugin");
			hash.update("2");
		});
	}
}
module.exports = FunctionModuleTemplatePlugin;
