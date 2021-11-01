function loader(source, ...rest){
    const callback = this.async();
    console.log('=====loader1=========')
    console.log(source)
    console.log(rest)
    console.log('=====loader1=========')
    setTimeout(() => {
        // source = "import ___CSS_LOADER_API_IMPORT___ from \"../src/test.js\";\n" + source
        if(rest[0].sources[0] === 'index.js'){
            source = "import ___CSS_LOADER_API_IMPORT___ from \"../src/index.css\";\n" + source
        } 
        callback(null, source)
    }, 3000);
}

loader.raw = true

module.exports = loader
