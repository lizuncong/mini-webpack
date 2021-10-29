const postcss = require('postcss')
const fs = require('fs')
const loaderUtils = require('loader-utils')

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
              url: atRule.params.replace(/['""]/g, ""), // './common.css'
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

              atRule.remove(); // eslint-disable-next-line consistent-return

              return {
                url: resolvedUrl,
                media,
                prefix,
                isRequestable
              };
            }
          }))

          const urlToNameMap = new Map();
          for (let index = 0; index <= resolvedAtRules.length - 1; index++) {
            const resolvedAtRule = resolvedAtRules[index];

            const {
              url,
              isRequestable,
              prefix,
              media
            } = resolvedAtRule;
            const newUrl = url;
            let importName = urlToNameMap.get(newUrl);
            
            if (!importName) {
              importName = `___CSS_LOADER_AT_RULE_IMPORT_${urlToNameMap.size}___`;
              urlToNameMap.set(newUrl, importName);
              console.log('options.urlHandler(newUrl)', options.urlHandler(newUrl))
              options.imports.push({
                importName,
                url: options.urlHandler(newUrl),
                index
              });
            }
            options.api.push({
              importName,
              media,
              index
            });
          }
        }

      };
    }

  };
};
plugin.postcss = true


async function loader(source){
  const callback = this.async();
  const options = {
    import:true,
    esModule:true,
    importLoaders:undefined,
    modules:false,
    sourceMap:false,
    url:true
  }
  const importPluginImports = [];
  const importPluginApi = [];
  const resolver = this.getResolve({});

  const {
    resourcePath
  } = this;
  let result;
  const result = await postcss([
    plugin({
      imports: importPluginImports,
      api: importPluginApi,
      resolver,
      context: this.context,
      urlHandler: url => {
        const loadersRequest = this.loaders.slice(this.loaderIndex, this.loaderIndex + 1).map(x => x.request).join("!");
        const req = `-!${loadersRequest}!`
        const comReq = req + url
        return loaderUtils.stringifyRequest(this, comReq)
      }
    })
  ])
  .process(source, { 
    hideNothingWarning: true,
    from: resourcePath,
    to: resourcePath,
    map
  })
  const imports = [].concat(importPluginImports);
  const api = [].concat(importPluginApi);
  imports.unshift({
    importName: "___CSS_LOADER_API_IMPORT___",
    url: loaderUtils.stringifyRequest(this, require.resolve("./runtime/api"))
  });
  // return ''
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

