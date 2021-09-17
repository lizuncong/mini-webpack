const path = require('path')
// 打包后自动发布
class UploadPlugin{
    constructor(options){
        const { bucket = '', domain = '', accessKey = '', secretKey = ''} = options;
    }

    apply(compiler){
        compiler.hooks.afterEmit.tapPromise('UploadPlugin', (compilation) => {
            const assets = compilation.assets
            const promises = []
            Object.keys(assets).forEach(filename => {
                promises.push(this.upload(filename))
            })
            return Promise.all(promises)
        })
    }

    upload(filename){
        const localFile = path.resolve(__dirname, '../dist', filename)
        return new Promise((resolve, reject) => {
            resolve('success：' + localFile )
        })
    }
}

module.exports = UploadPlugin