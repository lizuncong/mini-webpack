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
};
