const path = require('path')
const NormalModule = require('./NormalModule.js')
class NormalModuleFactory {
    // create(data){
    //     return new NormalModule(data);
    // }
    create(data, callback){
        data = {
            dependencies:[{
                module:null,
                optional:false,
                request:'./src/index.js',
                userRequest:'./src/index.js',
                weak:false
            }],
            contextInfo:{issuer: '', compiler: undefined},
            context:'/Users/lizuncong/Documents/手写源码系列/mini-webpack',
        }
    }
}

module.exports = new NormalModuleFactory()