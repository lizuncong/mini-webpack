const Template = require('../Template') 
class JsonpMainTemplatePlugin {
	apply(mainTemplate) {
		mainTemplate.hooks.hash.tap("JsonpMainTemplatePlugin", hash => {
			hash.update("jsonp");
			hash.update("6");
		});

		mainTemplate.hooks.localVars.tap(
			"JsonpMainTemplatePlugin",
			(source, chunk, hash) => {
				return source;
			}
		);
	}
}
module.exports = JsonpMainTemplatePlugin;
