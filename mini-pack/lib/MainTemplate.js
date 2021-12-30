const {
	Tapable,
	SyncWaterfallHook,
	SyncHook,
	SyncBailHook
} = require("tapable");
const Template = require('./Template')
const OriginalSource = require('../webpack-sources/OriginalSource')
const ConcatSource = require('../webpack-sources/ConcatSource')
const PrefixSource = require('../webpack-sources/PrefixSource')
const RawSource = require('../webpack-sources/RawSource')
// require function shortcuts:
// __webpack_require__.s = the module id of the entry point
// __webpack_require__.c = the module cache
// __webpack_require__.m = the module functions
// __webpack_require__.p = the bundle public path
// __webpack_require__.i = the identity function used for harmony imports
// __webpack_require__.e = the chunk ensure function
// __webpack_require__.d = the exported property define getter function
// __webpack_require__.o = Object.prototype.hasOwnProperty.call
// __webpack_require__.r = define compatibility on export
// __webpack_require__.t = create a fake namespace object
// __webpack_require__.n = compatibility get default export
// __webpack_require__.h = the webpack hash
// __webpack_require__.w = an object containing all installed WebAssembly.Instance export objects keyed by module id
// __webpack_require__.oe = the uncaught error handler for the webpack runtime
// __webpack_require__.nc = the script nonce

module.exports = class MainTemplate extends Tapable {

	constructor(outputOptions) {
		super();
		this.outputOptions = outputOptions || {};
		this.hooks = {
			assetPath: new SyncWaterfallHook(["path", "options", "assetInfo"]),
			hash: new SyncHook(["hash"]),
			renderManifest: new SyncWaterfallHook(["result", "options"]),
			// bootstrap: new SyncWaterfallHook([
			// 	"source",
			// 	"chunk",
			// 	"hash",
			// 	"moduleTemplate",
			// 	"dependencyTemplates"
			// ]),
			modules: new SyncWaterfallHook([
				"modules",
				"chunk",
				"hash",
				"moduleTemplate",
				"dependencyTemplates"
			]),
			render: new SyncWaterfallHook([
				"source",
				"chunk",
				"hash",
				"moduleTemplate",
				"dependencyTemplates"
			]),
			moduleObj: new SyncWaterfallHook([
				"source",
				"chunk",
				"hash",
				"moduleIdExpression"
			]),
			startup: new SyncWaterfallHook(["source", "chunk", "hash"]),
			requireExtensions: new SyncWaterfallHook(["source", "chunk", "hash"]),
			require: new SyncWaterfallHook(["source", "chunk", "hash"]),
			localVars: new SyncWaterfallHook(["source", "chunk", "hash"]),
		};
		this.hooks.localVars.tap("MainTemplate", (source, chunk, hash) => {
			return Template.asString([
				source,
				"// The module cache",
				"var installedModules = {};"
			]);
		});
		this.hooks.require.tap("MainTemplate", (source, chunk, hash) => {
			return Template.asString([
				source,
				"// Check if module is in cache",
				"if(installedModules[moduleId]) {",
				Template.indent("return installedModules[moduleId].exports;"),
				"}",
				"// Create a new module (and put it into the cache)",
				"var module = installedModules[moduleId] = {",
				Template.indent(this.hooks.moduleObj.call("", chunk, hash, "moduleId")),
				"};",
				"",
				Template.asString([
					"// Execute the module function",
					`modules[moduleId].call(module.exports, module, module.exports, ${this.renderRequireFunctionForModule(
						hash,
						chunk,
						"moduleId"
					)});`
				]
				),
				"",
				"// Flag the module as loaded",
				"module.l = true;",
				"",
				"// Return the exports of the module",
				"return module.exports;"
			]);
		});
		this.hooks.moduleObj.tap(
			"MainTemplate",
			(source, chunk, hash, varModuleId) => {
				return Template.asString(["i: moduleId,", "l: false,", "exports: {}"]);
			}
		);
		this.hooks.requireExtensions.tap("MainTemplate", (source, chunk, hash) => {
			const buf = [];
			buf.push("");
			buf.push("// expose the modules object (__webpack_modules__)");
			buf.push(`${this.requireFn}.m = modules;`);

			buf.push("");
			buf.push("// expose the module cache");
			buf.push(`${this.requireFn}.c = installedModules;`);

			buf.push("");
			buf.push("// define getter function for harmony exports");
			buf.push(`${this.requireFn}.d = function(exports, name, getter) {`);
			buf.push(
				Template.indent([
					`if(!${this.requireFn}.o(exports, name)) {`,
					Template.indent([
						"Object.defineProperty(exports, name, { enumerable: true, get: getter });"
					]),
					"}"
				])
			);
			buf.push("};");

			buf.push("");
			buf.push("// define __esModule on exports");
			buf.push(`${this.requireFn}.r = function(exports) {`);
			buf.push(
				Template.indent([
					"if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {",
					Template.indent([
						"Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });"
					]),
					"}",
					"Object.defineProperty(exports, '__esModule', { value: true });"
				])
			);
			buf.push("};");

			buf.push("");
			buf.push("// create a fake namespace object");
			buf.push("// mode & 1: value is a module id, require it");
			buf.push("// mode & 2: merge all properties of value into the ns");
			buf.push("// mode & 4: return value when already ns object");
			buf.push("// mode & 8|1: behave like require");
			buf.push(`${this.requireFn}.t = function(value, mode) {`);
			buf.push(
				Template.indent([
					`if(mode & 1) value = ${this.requireFn}(value);`,
					`if(mode & 8) return value;`,
					"if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;",
					"var ns = Object.create(null);",
					`${this.requireFn}.r(ns);`,
					"Object.defineProperty(ns, 'default', { enumerable: true, value: value });",
					"if(mode & 2 && typeof value != 'string') for(var key in value) " +
						`${this.requireFn}.d(ns, key, function(key) { ` +
						"return value[key]; " +
						"}.bind(null, key));",
					"return ns;"
				])
			);
			buf.push("};");

			buf.push("");
			buf.push(
				"// getDefaultExport function for compatibility with non-harmony modules"
			);
			buf.push(this.requireFn + ".n = function(module) {");
			buf.push(
				Template.indent([
					"var getter = module && module.__esModule ?",
					Template.indent([
						"function getDefault() { return module['default']; } :",
						"function getModuleExports() { return module; };"
					]),
					`${this.requireFn}.d(getter, 'a', getter);`,
					"return getter;"
				])
			);
			buf.push("};");

			buf.push("");
			buf.push("// Object.prototype.hasOwnProperty.call");
			buf.push(
				`${this.requireFn}.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };`
			);

			const publicPath = ''
			buf.push("");
			buf.push("// __webpack_public_path__");
			buf.push(`${this.requireFn}.p = ${JSON.stringify(publicPath)};`);
			return Template.asString(buf);
		});
		this.hooks.startup.tap("MainTemplate", (source, chunk, hash) => {
			const buf = [];
			if (chunk.entryModule) {
				buf.push("// Load entry module and return exports");
				buf.push(
					`return ${this.renderRequireFunctionForModule(
						hash,
						chunk,
						JSON.stringify(chunk.entryModule.id)
					)}(${this.requireFn}.s = ${JSON.stringify(chunk.entryModule.id)});`
				);
			}
			return Template.asString(buf);
		});
		this.hooks.render.tap(
			"MainTemplate",
			(bootstrapSource, chunk, hash, moduleTemplate, dependencyTemplates) => {
				const source = new ConcatSource();
				source.add("/******/ (function(modules) { // webpackBootstrap\n");
				
				// PrefixSource的目标是将\t制表符替换成/******/
				source.add(new PrefixSource("/******/", bootstrapSource));
				source.add("/******/ })\n");
				source.add(
					"/************************************************************************/\n"
				);
				source.add("/******/ (");
				// 在JavascriptModulesPlugin中注册this.hooks.modules插件
				source.add(
					this.hooks.modules.call(
						new RawSource(""),
						chunk,
						hash,
						moduleTemplate,
						dependencyTemplates
					)
				);
				source.add(")");
				return source;
			}
		);
		this.requireFn = "__webpack_require__";
	}
	getRenderManifest(options){
		const result = [];
		// 在JavascriptModulesPlugin.js中注册renderManifest插件
		this.hooks.renderManifest.call(result, options);

		return result;
	}

	updateHash(hash) {
		hash.update("maintemplate");
		hash.update("3");
		this.hooks.hash.call(hash);
	}

	getAssetPathWithInfo(path, options){
		const assetInfo = {};
		const newPath = this.hooks.assetPath.call(path, options, assetInfo);
		return { path: newPath, info: assetInfo }
	}
	getAssetPath(path, options) {
		return this.hooks.assetPath.call(path, options);
	}
	renderBootstrap(hash, chunk, moduleTemplate, dependencyTemplates){
		const buf = [''];
		buf.push(this.hooks.localVars.call("", chunk, hash));
		buf.push("");
		buf.push("// The require function");
		buf.push(`function ${this.requireFn}(moduleId) {`);
		buf.push(Template.indent(this.hooks.require.call("", chunk, hash)));
		buf.push("}");
		buf.push("");
		buf.push(
			Template.asString(this.hooks.requireExtensions.call("", chunk, hash))
		);
		buf.push("");
		buf.push("");
		buf.push(Template.asString(this.hooks.startup.call("", chunk, hash)));
		return buf;
	}
	render(hash, chunk, moduleTemplate, dependencyTemplates) {
		const buf = this.renderBootstrap(
			hash,
			chunk,
			moduleTemplate,
			dependencyTemplates
		);
		let source = this.hooks.render.call(
			new OriginalSource(
				Template.prefix(buf, " \t") + "\n",
				"webpack/bootstrap"
			),
			chunk,
			hash,
			moduleTemplate,
			dependencyTemplates
		);
		chunk.rendered = true;
		source.children.push(';')
		return source
	}
	renderRequireFunctionForModule(){
		return this.requireFn
	}
};
