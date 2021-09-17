function loader(source){
    console.log('pitchLoader...', source)
}

loader.pitch = function(){
    console.log('pitch...')
}

module.exports = loader