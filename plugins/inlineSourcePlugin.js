// 这个插件将外链的标签变成内联的标签
const HtmlWebpackPlugin = require('html-webpack-plugin')
class InlineSourcePlugin{
    constructor({ match }){
        this.reg = match
    }

    processTag(tag, compilation){
        let newTag;
        const url = tag.attributes.src;
        if(tag.tagName === 'script' && this.reg.test(url)){
            newTag = {
                tagName: tag.tagName,
            }
            newTag.innerHTML = compilation.assets[url].source();
            delete compilation.assets[url]
            return newTag
        }


        return tag
    }
    processTags(data, compilation){
        let headTags = []
        let bodyTags = []
        data.headTags.forEach(headTag => {
            headTags.push(this.processTag(headTag, compilation))
        })

        data.bodyTags.forEach(bodyTag => {
            bodyTags.push(this.processTag(bodyTag, compilation))
        })

        return { ...data, headTags, bodyTags }
    }

    apply(compiler){
        compiler.hooks.compilation.tap('InlineSourcePlugin', (compilation) => {
            HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync('alterPlugin', (data, cb) => {
                data = this.processTags(data, compilation);
                cb(null, data)
            })
        })
    }
}

module.exports = InlineSourcePlugin