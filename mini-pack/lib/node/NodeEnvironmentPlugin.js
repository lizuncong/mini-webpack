const fs = require('fs')
class NodeEnvironmentPlugin {
    apply(compiler){
        compiler.inputFileSystem = fs;
        compiler.outputFileSystem = fs
    }
}

module.exports = NodeEnvironmentPlugin