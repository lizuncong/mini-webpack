function loader(source){
  console.log('loader2======', source)
  return source + '//loader2'
}

module.exports = loader
