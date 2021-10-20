const babel = require('@babel/core')
const loaderUtils = require('loader-utils')
function loader(source){
  const options = loaderUtils.getOptions(this);
  const cb = this.async();
  console.log('this.resourcePath..', this.resourcePath)
  babel.transform(source, {
    ...options,
    sourceMap: true,
    filename: this.resourcePath.split('/').pop(), // 文件名，也用于sourcemap，如果不设置这个选项，那么在浏览器控制台sources tab下看到源码文件名称为unknown
  }, function(err, result){
    cb(err, result.code, result.map)
  })
}

module.exports = loader
