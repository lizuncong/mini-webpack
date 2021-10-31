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
              url: atRule.params.replace(/['""]/g, ""), //atRule.params的值为"'./common.css'"，因此需要将引号去掉 './common.css'
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

              atRule.remove(); // 将@import语句移除

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

module.exports = plugin;
