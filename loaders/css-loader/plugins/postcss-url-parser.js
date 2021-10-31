const needParseDeclaration = /(?:url|(?:-webkit-)?image-set)\(/i;

const plugin = (options = {}) => {
  return {
    postcssPlugin: "postcss-url-parser",

    prepare(result) {
      const parsedDeclarations = [];
      return {
        Declaration(declaration) {
          // 解析值为 url(./2.png)的声明
          if (!needParseDeclaration.test(declaration.value)) {
            return;
          }
          const reg = /url\((.+?)\)/g;
          const res = reg.exec(declaration.value)
          parsedDeclarations.push({
            declaration,
            url: res[1].replace(/['""]/g, "")  // './2.png'
          })
        },

        async OnceExit() {
          if (parsedDeclarations.length === 0) {
            return;
          }

          const resolvedDeclarations = await Promise.all(parsedDeclarations.map(async parsedDeclaration => {
            const {
              url
            } = parsedDeclaration;

            const {
              resolver,
              context
            } = options;
            const resolvedUrl = await resolver(context, url);

            if (!resolvedUrl) {
              return;
            }


            return {
              ...parsedDeclaration,
              url: resolvedUrl, // '/Users/lizuncong/Documents/手写源码系列/mini-webpack/src/2.png'
            };
          }));



          const urlToNameMap = new Map();
          const urlToReplacementMap = new Map();
          let hasUrlImportHelper = false;

          for (let index = 0; index <= resolvedDeclarations.length - 1; index++) {
            const item = resolvedDeclarations[index];
            if (!hasUrlImportHelper) {
              options.imports.push({
                importName: "___CSS_LOADER_GET_URL_IMPORT___",
                url: options.urlHandler(require.resolve("../runtime/getUrl.js")),
                index: -1
              });
              hasUrlImportHelper = true;
            }

            const { url } = item; // url: '/Users/lizuncong/Documents/手写源码系列/mini-webpack/src/2.png'
            const newUrl =  url;
            let importName = urlToNameMap.get(newUrl);

            if (!importName) {
              importName = `___CSS_LOADER_URL_IMPORT_${urlToNameMap.size}___`;
              urlToNameMap.set(newUrl, importName);
              options.imports.push({
                importName, // '___CSS_LOADER_URL_IMPORT_0___'
                url: options.urlHandler(newUrl), // '"./2.png"'
                index
              });
            }

            const replacementKey = JSON.stringify({
              newUrl
            });
            let replacementName = urlToReplacementMap.get(replacementKey);

            if (!replacementName) {
              replacementName = `___CSS_LOADER_URL_REPLACEMENT_${urlToReplacementMap.size}___`;
              urlToReplacementMap.set(replacementKey, replacementName);
              options.replacements.push({
                replacementName, // '___CSS_LOADER_URL_REPLACEMENT_0___'
                importName, // '___CSS_LOADER_URL_IMPORT_0___'
              });
            }

            item.declaration.value = `url(${replacementName})`;
          }
        }

      };
    }

  };
};

plugin.postcss = true;

module.exports = plugin;
