
const ReplaceSource = require('../webpack-sources/ReplaceSource')
class JavascriptGenerator {
    constructor(){
        
    }

    generate(module, dependencyTemplates, runtimeTemplate){
        const originalSource = module.originalSource();
        const source = new ReplaceSource(originalSource);
        this.sourceBlock(
			module,
			module,
			[],
			dependencyTemplates,
			source,
			runtimeTemplate
		);
        return source
    }
    sourceBlock(
		module,
		block,
		availableVars,
		dependencyTemplates,
		source,
		runtimeTemplate
	) {
		for (const dependency of block.dependencies) {
			this.sourceDependency(
				dependency,
				dependencyTemplates,
				source,
				runtimeTemplate
			);
		}
	}
    sourceDependency(dependency, dependencyTemplates, source, runtimeTemplate) {
		const template = dependencyTemplates.get(dependency.constructor);
		if (!template) {
			throw new Error(
				"No template for dependency: " + dependency.constructor.name
			);
		}
		template.apply(dependency, source, runtimeTemplate, dependencyTemplates);
	}
}

module.exports = JavascriptGenerator;
