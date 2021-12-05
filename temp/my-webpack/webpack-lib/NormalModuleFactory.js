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


        

        // 1.调用normalResolver.resolve方法解析模块，解析结果：
        const resolvrResult = {
            resource: '/Users/lizuncong/Documents/手写源码系列/mini-webpack/src/index.js',
            resourceResolveData: {
                module: false,
                path:'/Users/lizuncong/Documents/手写源码系列/mini-webpack/src/index.js',
                file: false,
                descriptionFileRoot: '/Users/lizuncong/Documents/手写源码系列/mini-webpack',
                descriptionFilePath: '/Users/lizuncong/Documents/手写源码系列/mini-webpack/package.json',
                descriptionFileData: { // package.json数据
                    name: 'mini-webpack', 
                    version: '1.0.0',
                     description: '', 
                     main: 'index.js', 
                }, 
                context: {issuer: '', compiler: undefined},
                query: '',
                relativePath: './src/index.js',
                request: undefined,
                __innerRequest: './src/index.js',
                __innerRequest_relativePath: './src/index.js',
                __innerRequest_request: undefined
            },
        }
        // 2.读取loaders
        const useLoaders = [
            {
                options: undefined, 
                loader: '/Users/lizuncong/Documents/手写源码系列/mini-webpack/loaders/loader1'
            }
        ]

        const resolveResult = {
            request:'/Users/lizc/Documents/MYProjects/mini-webpack/loaders/loader1.js!/Users/lizc/Documents/MYProjects/mini-webpack/src/index.js',
            rawRequest:'./src/index.js',
            parser: {},
            matchResource:undefined,
            loaders:[{
                loader:'/Users/lizc/Documents/MYProjects/mini-webpack/loaders/loader1.js',
                options:undefined
            }],
            generator:{},
            dependencies: [{
                optional:false,
                request:'./src/index.js',
                userRequest:'./src/index.js'
            }],
            context:'/Users/lizc/Documents/MYProjects/mini-webpack',
            resolveOptions:{},
            resource:'/Users/lizc/Documents/MYProjects/mini-webpack/src/index.js',
            resourceResolveData: {},
            type:'javascript/auto',
            settings:{},
            userRequest:'/Users/lizc/Documents/MYProjects/mini-webpack/src/index.js'
        }
        const createdModule = new NormalModule(resolveResult)
        callback(null, module)
    }
}

module.exports = new NormalModuleFactory()