const postcss = require('postcss')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const postcssMediaParser = require('./postcss-plugins/postcss-media-parser')
class Index {
    constructor(){
    }
    async extraMediaCss(source){
        const mediaRules = [];
        const result = await postcss([
            postcssMediaParser({
                mediaRules,
            })
          ])
          .process(source, {
            hideNothingWarning: true,
            // from: resourcePath,
            // to: resourcePath,
            map: false
          })
        return {
            css: result.css,
            mediaRules,
        }
    }
    generateMediaCssFile(filename, mediaRules, assets){
        const prefix = filename.split(/\.css$/)[0]
        const filenames = [];
        mediaRules.forEach(mediaRule => {
            const { width, ruleStr, params } = mediaRule
            const name = `${prefix}@${width}.css`
            filenames.push({name, params})
            assets[name] = {
                source(){
                    return ruleStr
                },
                size(){
                    return ruleStr.length
                }
            }
        });
        return filenames
    }
    async addLinkTag(data, mediaCssFileNames){
        const headTags = data.headTags;
        mediaCssFileNames.forEach(file => {
            const linkTag = {
                tagName: 'link',
                voidTag: true,
                attributes: { href: file.name, media: file.params, rel: 'stylesheet' }  
            }
            headTags.push(linkTag)
        })

        return { ...data, ...headTags }
    }
    apply(compiler){
        const reg = /\.css$/;
        compiler.hooks.emit.tapPromise('MediaExtractPlugin', async (compilation) => {
            let mediaCssFileNames = [];
            HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapPromise('alterPlugin', async (data) => {
                return await this.addLinkTag(data, mediaCssFileNames);
            })
            const assets = compilation.assets;
            await Object.entries(assets).map(async ([filename, statObj]) => {
                if(!reg.test(filename)) return
                const { css, mediaRules } = await this.extraMediaCss(assets[filename].source())
                mediaCssFileNames = await this.generateMediaCssFile(filename, mediaRules, assets)
                assets[filename] = {
                    source() {
                        return  css
                    },
                    size() {
                        return css.length
                    }
                }
            })
        })
    }
}

module.exports = Index