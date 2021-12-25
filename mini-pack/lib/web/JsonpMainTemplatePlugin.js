class JsonpMainTemplatePlugin {
	apply(mainTemplate) {
		mainTemplate.hooks.hash.tap("JsonpMainTemplatePlugin", hash => {
			hash.update("jsonp");
			hash.update("6");
		});
	}
}
module.exports = JsonpMainTemplatePlugin;
