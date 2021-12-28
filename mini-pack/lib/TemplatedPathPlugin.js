const REGEXP_NAME = /\[name\]/gi;

class TemplatedPathPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap("TemplatedPathPlugin", compilation => {
			const mainTemplate = compilation.mainTemplate;
			mainTemplate.hooks.assetPath.tap(
				"TemplatedPathPlugin",
				(path, data, assetInfo) => {
					if(data && data.chunk){
						return path.replace(REGEXP_NAME, data.chunk.name)
					}
					return path;
                }
			);
		});
	}
}

module.exports = TemplatedPathPlugin;
