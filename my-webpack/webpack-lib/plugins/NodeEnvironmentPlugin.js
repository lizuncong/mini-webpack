const fs = require('fs')
class NodeEnvironmentPlugin {
    apply(compiler){
        // 指定读文件的时候用哪个模块来读
        compiler.inputFileSystem = fs;
        // 指定写文件的时候通过哪个模块来写
        compiler.outputFileSystem = fs
    }
}

module.exports = NodeEnvironmentPlugin