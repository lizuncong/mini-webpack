// const img = require('./2.jpg')
const css = require('./index.css')
console.log('css...module', css)
console.log('css...', css.default.toString())
const ele = document.createElement('div')
ele.innerHTML = 'hello world';
document.body.appendChild(ele)

const styleEle = document.createElement('style')
styleEle.appendChild(document.createTextNode(css.default.toString()))

document.head.appendChild(styleEle)
