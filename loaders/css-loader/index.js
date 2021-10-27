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
              url: atRule.params, // './common.css'
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
            // 不考虑绝对路径，只考虑相对路径的引用情况，比如： @import "./common.css"
            if (isRequestable) {
              const {
                resolver,
                context
              } = options;
              const resolvedUrl = await resolver(context, url);

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
          }))
        }

      };
    }

  };
};
plugin.postcss = true


function loader(source){
  const importPluginImports = [];
  const importPluginApi = [];
  const resolver = this.getResolve({
    conditionNames: ["style"],
    extensions: [".css"],
    mainFields: ["css", "style", "main", "..."],
    mainFiles: ["index", "..."]
  });
  postcss([
    plugin({
      imports: importPluginImports,
      api: importPluginApi,
      resolver,
      context: this.context,
      rootContext: this.rootContext,
      urlHandler: url => (0, _loaderUtils.stringifyRequest)(this, (0, _utils.combineRequests)((0, _utils.getPreRequester)(this)(options.importLoaders), url))
    })
  ])
  .process(source, { to: './app.css' })
  .then(result => {
    console.log('result...', result)
    fs.writeFile('./app.css', result.css, () => true)
  })
  return ''
    // const reg = /url\((.+?)\)/g;
    // let pos = 0;
    // let current;
    // const arr = ['let list = []']
    // while(current = reg.exec(source)){
    //     const [matchUrl, g] = current
    //     const last = reg.lastIndex - matchUrl.length
    //     arr.push(`list.push(${JSON.stringify(source.slice(pos, last))})`)
    //     pos = reg.lastIndex;
    //     arr.push(`list.push('url('+require(${g})+')')`)
    // }

    // arr.push(`list.push(${JSON.stringify(source.slice(pos))})`)
    // arr.push(`module.exports = list.join('')`)
    // return arr.join('\r\n')
}

module.exports = loader

// 'body{\n    color: blue;\n    background: yellow;\n    background: url(___CSS_LOADER_URL_REPLACEMENT_0___);\n}\n\n.container{\n    color: red;\n}'
