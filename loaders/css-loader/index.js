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

// Imports
import ___CSS_LOADER_API_IMPORT___ from "../node_modules/css-loader/dist/runtime/api.js";
import ___CSS_LOADER_AT_RULE_IMPORT_0___ from "-!../node_modules/css-loader/dist/cjs.js??ref--7-1!./common.css";
import ___CSS_LOADER_GET_URL_IMPORT___ from "../node_modules/css-loader/dist/runtime/getUrl.js";
import ___CSS_LOADER_URL_IMPORT_0___ from "./2.jpg";
var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});
___CSS_LOADER_EXPORT___.i(___CSS_LOADER_AT_RULE_IMPORT_0___);
var ___CSS_LOADER_URL_REPLACEMENT_0___ = ___CSS_LOADER_GET_URL_IMPORT___(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "body{\n    background: yellow;\n    background: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n}", ""]);
// Exports
export default ___CSS_LOADER_EXPORT___;


const loaderUtils = require('loader-utils')
const postcss = require("postcss");
async function loader(source){
    const rawOptions = loaderUtils.getOptions(this) || {}
    const plugins = []
    const callback = this.async();
    const options = {
        esModule:true,
        import:true,
        importLoaders:undefined,
        modules:false,
        sourceMap:true,
        url:true
    }
    const replacements = []
    const exports = [];
    const importPluginImports = []
    const importPluginApi = [];

    plugins.push(
        importParser({
            imports: importPluginImports,
            api: importPluginApi,
            context: this.context,
            rootContext: this.rootContext,
            filter: () => true,
            resolver: this.getResolve({
                conditionNames: ["style"],
                extensions: [".css"],
                mainFields: ["css", "style", "main", "..."],
                mainFiles: ["index", "..."],
            }),
            urlHandler: (url) =>
                stringifyRequest(
                    this,
                    combineRequests(getPreRequester(this)(options.importLoaders), url)
                ),
        })
    );

    const urlPluginImports = [];
    plugins.push(
        urlParser({
            imports: urlPluginImports,
            replacements,
            context: this.context,
            rootContext: this.rootContext,
            filter: () => true,
            resolver: this.getResolve({
                conditionNames: ["asset"],
                mainFields: ["asset"],
                mainFiles: [],
                extensions: [],
            }),
            urlHandler: (url) => stringifyRequest(this, url),
        })
    );

    const {
        resourcePath
    } = this;
    let result;
    result = await postcss(plugins).process(content, {
        hideNothingWarning: true,
        from: resourcePath,
        to: resourcePath,
        map: options.sourceMap
            ? {
                prev: map ? normalizeSourceMap(map, resourcePath) : null,
                inline: false,
                annotation: false,
            }
            : false,
    });

    const imports = []
        .concat(icssPluginImports.sort(sort))
        .concat(importPluginImports.sort(sort))
        .concat(urlPluginImports.sort(sort));
    const api = []
        .concat(importPluginApi.sort(sort))
        .concat(icssPluginApi.sort(sort));

    if (options.modules.exportOnlyLocals !== true) {
        imports.unshift({
            importName: "___CSS_LOADER_API_IMPORT___",
            url: stringifyRequest(this, require.resolve("./runtime/api")),
        });

        if (options.sourceMap) {
            imports.unshift({
                importName: "___CSS_LOADER_API_SOURCEMAP_IMPORT___",
                url: stringifyRequest(
                    this,
                    require.resolve("./runtime/cssWithMappingToString")
                ),
            });
        }
    }

    const importCode = getImportCode(imports, options);
    const moduleCode = getModuleCode(result, api, replacements, options, this);
    const exportCode = getExportCode(
        exports,
        replacements,
        needToUseIcssPlugin,
        options
    );

    callback(null, `${importCode}${moduleCode}${exportCode}`);
}

module.exports = loader
