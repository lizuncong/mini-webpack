const { Tapable, SyncWaterfallHook, SyncHook } = require("tapable");
module.exports = class ModuleTemplate extends Tapable {
	constructor(runtimeTemplate, type) {
		super();
		this.runtimeTemplate = runtimeTemplate;
		this.type = type;
		this.hooks = {
			hash: new SyncHook(["hash"]),
			render: new SyncWaterfallHook([
				"source",
				"module",
				"options",
				"dependencyTemplates"
			]),
			package: new SyncWaterfallHook([
				"source",
				"module",
				"options",
				"dependencyTemplates"
			]),
		};
	}

	updateHash(hash) {
		hash.update("1");
		this.hooks.hash.call(hash);
	}

	render(module, dependencyTemplates, options) {
		const moduleSource = module.source(
			dependencyTemplates,
			this.runtimeTemplate,
			this.type
		);
		const moduleSourcePostRender = this.hooks.render.call(
			moduleSource,
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
	}

};
