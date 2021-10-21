const loaderUtils = require('loader-utils')
function loader(source){
    const filename = loaderUtils.interpolateName(this, '[name].[hash].[ext]', { content: source })
    this.emitFile(filename, source)
    return `module.exports="${filename}"`
}

loader.raw = true // 以二进制流读取文件
module.exports = loader