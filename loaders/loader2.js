function loader(source, ...rest){
    console.log('=====loader2=========')
    return source
}

loader.pitch = function loader(request) {
    console.log('loader 2 pitch', request)
    return 'test'
};

module.exports = loader