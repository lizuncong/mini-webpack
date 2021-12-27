
const ReplaceSource = require('../webpack-sources/ReplaceSource')
class JavascriptGenerator {
    constructor(){
        
    }

    generate(module, dependencyTemplates, runtimeTemplate){
        const originalSource = module.originalSource();
        const source = new ReplaceSource(originalSource);
        return source
    }
}

module.exports = JavascriptGenerator;
