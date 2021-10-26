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

const plugin = (options = {}) => {
  return {
    postcssPlugin: "postcss-import-parser",

    prepare(result) {
      const parsedAtRules = [];
      return {
        AtRule: {
          import(atRule) {
            const parsedAtRule = {
              atRule,
              prefix: undefined,
              url: atRule.params,
              media: undefined,
              isRequestable: true
            };
            parsedAtRules.push(parsedAtRule);
          }
        },

        async OnceExit() {
          if (parsedAtRules.length === 0) {
            return;
          }

          const resolvedAtRules = await Promise.all(parsedAtRules.map(async parsedAtRule => {
            const {
              atRule,
              isRequestable,
              prefix,
              url,
              media
            } = parsedAtRule;

            if (isRequestable) {
              const request = (0, _utils.requestify)(url, options.rootContext);
              const {
                resolver,
                context
              } = options;
              const resolvedUrl = await (0, _utils.resolveRequests)(resolver, context, [...new Set([request, url])]);

              if (!resolvedUrl) {
                return;
              }

              atRule.remove(); // eslint-disable-next-line consistent-return

              return {
                url: resolvedUrl,
                media,
                prefix,
                isRequestable
              };
            }

            atRule.remove(); // eslint-disable-next-line consistent-return

            return {
              url,
              media,
              prefix,
              isRequestable
            };
          }))
        }

      };
    }

  };
};
plugin.postcss = true


fs.readFile('../../src/index.css', (err, css) => {
    postcss([plugin])
      .process(css, { from: '../../src/index.css', to: './app.css' })
      .then(result => {
        // console.log('result...', result)
        fs.writeFile('./app.css', result.css, () => true)
      })
})