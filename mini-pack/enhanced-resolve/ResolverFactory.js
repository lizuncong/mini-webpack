const Resolver = require("./Resolver");
const UnsafeCachePlugin = require('./UnsafeCachePlugin')
const ParsePlugin = require('./ParsePlugin')
const DescriptionFilePlugin = require('./DescriptionFilePlugin')
exports.createResolver = function(options) {
	let modules = ["node_modules"];
	const descriptionFiles = ["package.json"];
	const plugins = [];
	let mainFields = options.mainFields; // ["loader", "main"];
	const aliasFields = [];
	const mainFiles = options.mainFiles; // ["index"]
	let extensions = options.extensions; // ['.js', '.json'] 
	const cachePredicate = function() { return true }
	const fileSystem = options.fileSystem;
    const resolver = new Resolver(fileSystem)

	// 为resolver增加钩子
	resolver.ensureHook("resolve");
	// resolver.ensureHook("parsedResolve");

	plugins.push(new UnsafeCachePlugin(
			"resolve", // 当前钩子
			"newResolve" // 下一个钩子
		)
	)
	plugins.push(new ParsePlugin("newResolve", "parsedResolve"));

	plugins.push(
		new DescriptionFilePlugin(
			"parsedResolve",
			descriptionFiles, // ['package.json']
			"describedResolve"
		)
	);

	plugins.forEach(plugin => {
		plugin.apply(resolver);
	});
	return resolver;
};

