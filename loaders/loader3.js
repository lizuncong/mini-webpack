function loader(source){
  console.log('loader3=======', source)
  return source + '//loader3'
}

module.exports = loader
