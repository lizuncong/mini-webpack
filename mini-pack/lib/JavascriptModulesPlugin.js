
const Parser = require('./Parser')
const JavascriptGenerator = require('./JavascriptGenerator')
const Template = require('./Template')
class JavascriptModulesPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap(
			"JavascriptModulesPlugin",
			(compilation, { normalModuleFactory }) => {
				normalModuleFactory.hooks.createParser
				.tap("JavascriptModulesPlugin", options => {
					return new Parser(options, "auto");
				})
				normalModuleFactory.hooks.createGenerator
				.tap("JavascriptModulesPlugin", () => {
					return new JavascriptGenerator();
				});

				compilation.mainTemplate.hooks.renderManifest.tap(
					"JavascriptModulesPlugin",
					(result, options) => {
						const chunk = options.chunk;
						const hash = options.hash;
						const fullHash = options.fullHash;
						const outputOptions = options.outputOptions;
						const moduleTemplates = options.moduleTemplates;
						const dependencyTemplates = options.dependencyTemplates;

						const filenameTemplate =
							chunk.filenameTemplate || outputOptions.filename;

						const useChunkHash = true
						result.push({
							render: () => {
								return compilation.mainTemplate.render(
									hash,
									chunk,
									moduleTemplates.javascript,
									dependencyTemplates
								)
							},
							filenameTemplate,
							pathOptions: {
								noChunkHash: !useChunkHash,
								contentHashType: "javascript",
								chunk
							},
							identifier: `chunk${chunk.id}`,
							hash: useChunkHash ? chunk.hash : fullHash
						});
						return result;
					}
				);

				compilation.mainTemplate.hooks.modules.tap(
					"JavascriptModulesPlugin",
					(source, chunk, hash, moduleTemplate, dependencyTemplates) => {
						return Template.renderChunkModules(
							chunk,
							m => typeof m.source === "function",
							moduleTemplate,
							dependencyTemplates,
							"/******/ "
						);
					}
				);
			}
		);
	}
}

module.exports = JavascriptModulesPlugin;
