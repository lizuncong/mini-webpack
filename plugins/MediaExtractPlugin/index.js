const postcss = require('postcss')

class Index {
    constructor(){
        this.filename = 'filename'
    }
    extraMediaCss(source){

    }
    apply(compiler){
        const reg = /\.css$/;
        compiler.hooks.emit.tap('MediaExtractPlugin', (compilation) => {
            const assets = compilation.assets;
            Object.entries(assets).forEach(([filename, statObj]) => {
                if(!reg.test(filename)) return
                const str = this.extraMediaCss(assets[filename].source())
                assets[filename] = {
                    source() {
                        return  str
                    },
                    size() {
                        return str.length
                    }
                }
            })
        })
    }
}

module.exports = Index