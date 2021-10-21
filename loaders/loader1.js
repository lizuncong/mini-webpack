function loader(source, ...rest){
    const callback = this.async();
    console.log('=====loader1=========')
    console.log(source)
    console.log(rest)
    console.log('=====loader1=========')
    setTimeout(() => {
        callback(null, source)
    }, 3000);
    return source
}

loader.raw = true

module.exports = loader