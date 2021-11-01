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
              url: atRule.params.replace(/['""]/g, ""), //atRule.params的值为"'./common.css'"，因此需要将引号去掉 './common.css'
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
              url,
            } = parsedAtRule;
            // 不考虑绝对路径，只考虑相对路径的引用情况，比如： @import "./common.css"
            const {
              resolver,
              context
            } = options;
            const resolvedUrl = await resolver(context, url);

            atRule.remove(); // 将@import语句移除

            return {
              url: resolvedUrl,
            };
          }))

          const urlToNameMap = new Map();
          for (let index = 0; index <= resolvedAtRules.length - 1; index++) {
            const resolvedAtRule = resolvedAtRules[index];

            const {
              url,
            } = resolvedAtRule;
            const newUrl = url;
            let importName = urlToNameMap.get(newUrl);

            if (!importName) {
              importName = `___CSS_LOADER_AT_RULE_IMPORT_${urlToNameMap.size}___`;
              urlToNameMap.set(newUrl, importName);
              options.imports.push({
                importName,
                url: options.urlHandler(newUrl),
                index
              });
            }
            options.api.push({
              importName,
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
