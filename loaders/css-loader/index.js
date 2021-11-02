const postcss = require('postcss')
const loaderUtils = require('loader-utils')
const postcssImportParser = require('./plugins/postcss-import-parser')
const postcssUrlParser = require('./plugins/postcss-url-parser')
const { getImportCode, getModuleCode, getExportCode } = require('./utils')


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

  // 处理 @import './common.css'
  const importPluginImports = [];
  const importPluginApi = [];
  const resolver = this.getResolve({});
  // 处理url(./2.png)
  const urlPluginImports = [];
  const replacements = [];

  const {
    resourcePath
  } = this;
  const result = await postcss([
    postcssImportParser({
      imports: importPluginImports,
      api: importPluginApi,
      resolver,
      context: this.context,
      // urlHandler: url => loaderUtils.stringifyRequest(this, url)
      urlHandler: url => {
        const loadersRequest = this.loaders.slice(this.loaderIndex, this.loaderIndex + 1).map(x => x.request).join("!");
        const req = `-!${loadersRequest}!`
        const comReq = req + url
        return loaderUtils.stringifyRequest(this, comReq)
      }
    }),
    postcssUrlParser({
      imports: urlPluginImports,
      replacements,
      context: this.context,
      resolver,
      urlHandler: url => loaderUtils.stringifyRequest(this, url)
    })
  ])
  .process(source, {
    hideNothingWarning: true,
    from: resourcePath,
    to: resourcePath,
    map: false
  })
  // importPluginImports是个数组，数组里的元素为：
  // importName:'___CSS_LOADER_AT_RULE_IMPORT_0___'
  // index:0
  // url:'"-!../node_modules/css-loader/dist/cjs.js??ref--7-0!./common.css"'
  const imports = [].concat(importPluginImports).concat(urlPluginImports);
  // importPluginApi是个数组，数组里的元素为：
  // importName:'___CSS_LOADER_AT_RULE_IMPORT_0___'
  // index:0
  const api = [].concat(importPluginApi);
  imports.unshift({
    importName: "___CSS_LOADER_API_IMPORT___",
    url: loaderUtils.stringifyRequest(this, require.resolve("./runtime/api"))
  });

  // getImportCode 输出：
  // Imports
  // import ___CSS_LOADER_API_IMPORT___ from "../node_modules/css-loader/dist/runtime/api.js";
  // import ___CSS_LOADER_AT_RULE_IMPORT_0___ from "-!../node_modules/css-loader/dist/cjs.js??ref--7-0!./common.css";
  const importCode = getImportCode(imports)
  // console.log('==============importCode==============')
  // console.log(importCode)
  // getModuleCode输出：
  // var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});
  // ___CSS_LOADER_EXPORT___.i(___CSS_LOADER_AT_RULE_IMPORT_0___);
  // // Module
  // ___CSS_LOADER_EXPORT___.push([module.id, "body{\n    color: blue;\n    background: yellow;\n}\n\n\n.container{\n    color: red;\n}\n\n", ""]);
  const moduleCode = getModuleCode(result, api, replacements)
  // console.log('==============moduleCode==============')
  // console.log(moduleCode)
  // getExportCode输出：
  // Exports
  // export default ___CSS_LOADER_EXPORT___;
  const exportCode = getExportCode(options)
  // console.log('==============exportCode==============')
  // console.log(exportCode)

  const str = `${importCode}${moduleCode}${exportCode}`
  console.log('===========my css loader==========')
  console.log(str)
  console.log('===========my css loader 2222==========')
  callback(null, str);

}

module.exports = loader

