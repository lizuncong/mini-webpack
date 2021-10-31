exports.getImportCode = function(imports) {
    let code = "";

    for (const item of imports) {
      const { importName, url } = item;
      code += `import ${importName} from ${url};\n`;
    }

    return code ? `// Imports\n${code}` : "";
}


exports.getModuleCode = function(result, api, replacements) {
    let code = JSON.stringify(result.css);
    let beforeCode = `var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});\n`;

    for (const item of api) {
      beforeCode += `___CSS_LOADER_EXPORT___.i(${item.importName});\n`;
    }
    for (const item of replacements) {
      const { replacementName, importName } = item;
      beforeCode += `var ${replacementName} = ___CSS_LOADER_GET_URL_IMPORT___(${importName});\n`;
      code = code.replace(new RegExp(replacementName, "g"), () => `" + ${replacementName} + "`);
    }
    return `${beforeCode}// Module\n___CSS_LOADER_EXPORT___.push([module.id, ${code}, ""]);\n`;
}

exports.getExportCode = function() {
    let code = "// Exports\n";

    code += `export default ___CSS_LOADER_EXPORT___;\n`;
    return code;
}
