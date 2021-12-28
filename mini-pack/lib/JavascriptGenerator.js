
const ReplaceSource = require('../webpack-sources/ReplaceSource')
const ModuleDependencyTemplateAsId = require('./dependencies/ModuleDependencyTemplateAsId')
const moduleTemplate = new ModuleDependencyTemplateAsId()
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
		moduleTemplate.apply(dependency, source, runtimeTemplate);
	}
}

module.exports = JavascriptGenerator;
