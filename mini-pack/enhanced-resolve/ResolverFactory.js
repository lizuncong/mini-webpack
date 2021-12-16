const Resolver = require("./Resolver");
const UnsafeCachePlugin = require('./UnsafeCachePlugin')
const ParsePlugin = require('./ParsePlugin')
const DescriptionFilePlugin = require('./DescriptionFilePlugin')
const AliasFieldPlugin = require('./AliasFieldPlugin')
const JoinRequestPlugin = require('./JoinRequestPlugin')
const ResultPlugin = require('./ResultPlugin')
exports.createResolver = function(options) {
	let modules = ["node_modules"];
	const descriptionFiles = ["package.json"];
	const plugins = [];
	let mainFields = options.mainFields; // ["loader", "main"];
	const aliasFields = options.aliasFields || [];
	const mainFiles = options.mainFiles; // ["index"]
	const preferAbsolute = options.preferAbsolute || false;
	let extensions = options.extensions; // ['.js', '.json'] 
	const cachePredicate = function() { return true }
	const fileSystem = options.fileSystem;
    const resolver = new Resolver(fileSystem)

	// 为resolver增加钩子
	resolver.ensureHook("resolve");
	resolver.ensureHook("resolved");

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

	aliasFields.forEach(item => {
		plugins.push(new AliasFieldPlugin("describedResolve", item, "resolve"));
	});
	if (preferAbsolute) {
		plugins.push(new JoinRequestPlugin("describedResolve", "relative"));
	}
	plugins.push(
		new DescriptionFilePlugin(
			"relative",
			descriptionFiles,
			"resolved"
		)
	);
	plugins.push(new ResultPlugin(resolver.hooks.resolved));


	plugins.forEach(plugin => {
		plugin.apply(resolver);
	});
	return resolver;
};

