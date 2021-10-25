// function loader(source){
//     const reg = /url\((.+?)\)/g;
//     let pos = 0;
//     let current;
//     const arr = ['let list = []']
//     while(current = reg.exec(source)){
//         const [matchUrl, g] = current
//         const last = reg.lastIndex - matchUrl.length
//         arr.push(`list.push(${JSON.stringify(source.slice(pos, last))})`)
//         pos = reg.lastIndex;
//         arr.push(`list.push('url('+require(${g})+')')`)
//     }
//
//     arr.push(`list.push(${JSON.stringify(source.slice(pos))})`)
//     arr.push(`module.exports = list.join('')`)
//     return arr.join('\r\n')
// }
//
// module.exports = loader

const postcss = require('postcss')
const fs = require('fs')

const plugin1 = (opts = {}) => {
    // console.log('plugin1.opts...', opts)
    const variables = {}
    return {
        postcssPlugin: 'PLUGIN NAME',
        Once (root) {
            // console.log('root', root)
          // Calls once per file, since every file has single Root
        },
        Declaration (decl) {
            console.log('decl')
          // All declaration nodes
        },
        Declaration: {
            color: decl => {
                variables[decl.prop] = decl.value
                if(decl.value === 'blue'){
                    decl.value = 'black'
                }
                console.log('color..', decl.value)
              // All `color` declarations
            }
        },
          AtRule: {
            media: atRule => {
              // All @media at-rules
            }
          },
          OnceExit(){
            console.log('shared', variables)
          }
    
    }
}


plugin1.postcss = true

const plugin2 = (opts = {}) => {
    return {
      postcssPlugin: 'vars-collector',
      prepare (result) {
          console.log('plugin2..result', result)
        const variables = {}
        return {
          Declaration (node) {
            if (node.variable) {
              variables[node.prop] = node.value
            }
          },
          OnceExit () {
            console.log(variables)
          }
        }
      }
    }
  }

  plugin2.postcss = true
fs.readFile('../../src/index.css', (err, css) => {
    postcss([plugin1, plugin2])
      .process(css, { from: '../../src/index.css', to: './app.css' })
      .then(result => {
        // console.log('result...', result)
        fs.writeFile('./app.css', result.css, () => true)
      })
})