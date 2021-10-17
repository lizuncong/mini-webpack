function loader(source){
  console.log('loader1=======', source)
  return source + '//loader1'
}

module.exports = loader
