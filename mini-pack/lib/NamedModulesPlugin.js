class NamedModulesPlugin {
	constructor(options) {
		this.options = options || {};
	}

	apply(compiler) {
		compiler.hooks.compilation.tap("NamedModulesPlugin", compilation => {
			compilation.hooks.beforeModuleIds.tap("NamedModulesPlugin", modules => {
				const context = this.options.context || compiler.options.context;
				for (const module of modules) {
					if (module.id === null && module.libIdent) {
						module.id = module.libIdent({ context });
					}
				}
			});
		});
	}
}

module.exports = NamedModulesPlugin;
