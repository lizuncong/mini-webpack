const loaderUtils = require('loader-utils')
const less = require('less')
function loader(source){
    const options = loaderUtils.getOptions(this) || {}
    const done = this.async();
    // 必须的，不然无法解析index.less中 @import "./common.less"
    options.filename = this.resource; // '/Users/lizc/Documents/MYProjects/mini-webpack/src/index.less'
    less.render(source, options, (err, { css, imports } = {} ) => {
        if(err){
            done(err)
            return;
        }
        console.log('imports...', imports)
        // 必须的，收集.less文件中@import引入的文件
        imports.forEach(this.addDependency, this);
        done(err, css)
    })
}

module.exports = loader