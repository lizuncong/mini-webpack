function loader(source, ...rest){
    const callback = this.async();
    console.log('=====loader1=========')
    console.log(source)
    console.log(rest)
    console.log('=====loader1=========')
    setTimeout(() => {
        // source = "import ___CSS_LOADER_API_IMPORT___ from \"../src/test.js\";\n" + source
        source = "import ___CSS_LOADER_API_IMPORT___ from \"../src/2.png\";\n" + source

        callback(null, source)
    }, 3000);
}

loader.raw = true

module.exports = loader
