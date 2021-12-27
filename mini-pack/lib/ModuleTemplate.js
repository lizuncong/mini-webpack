const { Tapable, SyncWaterfallHook, SyncHook } = require("tapable");
module.exports = class ModuleTemplate extends Tapable {
	constructor(runtimeTemplate, type) {
		super();
		this.runtimeTemplate = runtimeTemplate;
		this.type = type;
		this.hooks = {
			hash: new SyncHook(["hash"])
		};
	}

	updateHash(hash) {
		hash.update("1");
		this.hooks.hash.call(hash);
	}

	render(module, dependencyTemplates, options) {
		try {
			const moduleSource = module.source(
				dependencyTemplates,
				this.runtimeTemplate,
				this.type
			);
			return
			const moduleSourcePostContent = this.hooks.content.call(
				moduleSource,
				module,
				options,
				dependencyTemplates
			);
			const moduleSourcePostModule = this.hooks.module.call(
				moduleSourcePostContent,
				module,
				options,
				dependencyTemplates
			);
			const moduleSourcePostRender = this.hooks.render.call(
				moduleSourcePostModule,
				module,
				options,
				dependencyTemplates
			);
			return this.hooks.package.call(
				moduleSourcePostRender,
				module,
				options,
				dependencyTemplates
			);
		} catch (e) {
			e.message = `${module.identifier()}\n${e.message}`;
			throw e;
		}
	}

};
