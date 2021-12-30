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

// 	/***/ "./src/index.js":     ====1
// /*!**********************!*\ ====1
//   !*** ./src/index.js ***!   ====1
//   \**********************/   ====1
// /*! no static exports found */ =====1
// /***/ (function(module, exports, __webpack_require__) { ====2

// const test = __webpack_require__(/*! ./test.js */"./src/test.js")

// console.log(test)


// /***/ })  ====2
	render(module, dependencyTemplates, options) {
		// 生成源码主体，以上面注释的为例，===2之间的由module.source生成
		const moduleSource = module.source(
			dependencyTemplates,
			this.runtimeTemplate,
			this.type
		);

		// ===2部分的代码由this.hooks.render生成
		// 在FunctionModuleTemplatePlugin.js中注册this.hooks.render钩子
		const moduleSourcePostRender = this.hooks.render.call(
			moduleSource,
			module,
			options,
			dependencyTemplates
		);

		// ===1部分的代码由this.hooks.package生成
		// 在FunctionModuleTemplatePlugin.js中注册this.hooks.package钩子
		return this.hooks.package.call(
			moduleSourcePostRender,
			module,
			options,
			dependencyTemplates
		);
	}

};
