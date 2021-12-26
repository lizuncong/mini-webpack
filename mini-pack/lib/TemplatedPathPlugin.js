const REGEXP_NAME = /\[name\]/gi;

class TemplatedPathPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap("TemplatedPathPlugin", compilation => {
			const mainTemplate = compilation.mainTemplate;
			mainTemplate.hooks.assetPath.tap(
				"TemplatedPathPlugin",
				(path, data, assetInfo) => {
					const newP = path.replace(REGEXP_NAME, data.chunk.name)
					return newP
                }
			);
		});
	}
}

module.exports = TemplatedPathPlugin;
