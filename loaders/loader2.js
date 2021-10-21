function loader(source, ...rest){
    console.log('=====loader2=========')
    console.log(source)
    console.log(rest)
    console.log('=====loader2=========')
    return source
}


module.exports = loader