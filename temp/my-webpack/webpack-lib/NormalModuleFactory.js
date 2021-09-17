const path = require('path')
const NormalModule = require('./NormalModule.js')
class NormalModuleFactory {
    create(data){
        return new NormalModule(data);
    }
}

module.exports = new NormalModuleFactory()