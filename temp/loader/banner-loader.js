const loaderUtils = require('loader-utils')
const {validate} = require('schema-utils')
const fs = require('fs')
// loader只能是普通函数，不能使用箭头函数，因为loader中，this提供了整个上下文的环境
function loader(source){
    this.cacheable && this.cacheable() // 是否打开缓存
    const options = loaderUtils.getOptions(this);
    const cb = this.async();
    const schema = {
        type: 'object',
        properties: {
            text: {
                type: 'string'
            },
            filename: {
                type: 'string'
            }
        }
    } 
    validate(schema, options, 'banner-loader')
    if(options.filename){
        this.addDependency(options.filename) // 自动的添加文件依赖，告诉webpack监听这个文件变化，当在webpack.config.js中添加watch:true配置项
        // 时，文件修改，就会重新编译
        fs.readFile(options.filename, 'utf8', function(err, data){
            cb(err, `/**${data}**/${source}`)
        })
    } else {
        cb(null, `/**${options.text}**/${source}`) 
    }
    return source
}

module.exports = loader