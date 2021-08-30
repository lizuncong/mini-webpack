// class Person{
//     constructor(){
//         this.name = 'lzc'
//     }
//     getName(){
//         return this.name
//     }
// }

// const p = new Person()


// console.log('name...', p.getName())

import p from './2.jpg'
import p2 from './2.png'
import './index.less'
const img = document.createElement('img')
img.src = p

const img2 = document.createElement('img')
img2.src = p2

document.body.appendChild(img)
document.body.appendChild(img2)