const fs = require('fs')
const path = require('path')
const generator = require('@babel/generator')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse')
const types = require('@babel/types')
const ejs = require('ejs')
const { SyncHook } = require('tapable')

class Compiler {
    constructor(config){
        this.config = config
        // 需要保存入口文件的路径
        this.entryId;
        // 需要保存所有的模块依赖
        this.modules = {}
        this.entry = config.entry
        this.root = process.cwd()
        this.hooks = {
            entryOptions: new SyncHook(),
            compile: new SyncHook(),
            afterCompile: new SyncHook(),
            afterPlugins: new SyncHook(),
            run: new SyncHook(),
            emit: new SyncHook(),
            done: new SyncHook()
        }
        this.hooks.entryOptions.call();
        const plugins = this.config.plugins;

        if(Array.isArray(plugins)){
            plugins.forEach((plugin) => {
                plugin.apply(this); // this就是compiler实例
            })
        }
        this.hooks.afterPlugins.call()
    }
    getSource(modulePath){
        const rules = this.config.module.rules
        let content = fs.readFileSync(modulePath, 'utf8')

        for(let i = 0; i < rules.length; i++){
            const {test, use} = rules[i]
            let len = use.length - 1
            if(test.test(modulePath)){
                function normalLoader(){
                    const loader = require(use[len--])
                    content = loader(content)
                    if(len >= 0){
                        normalLoader()
                    }
                }
                normalLoader()
            }
        }
        return content
    }
    parse(source, parentPath){
        const dependencies = []
        // 1.读取源代码并转换为抽象语法树
        const ast = parser.parse(source)


        // 2.traverse
        const visitor = {
            CallExpression: (p, state) => {
                const node = p.node
                if(node.callee.name === 'require'){
                    node.callee.name = '__webpack_require__'
                    let moduleName = node.arguments[0].value // 取到的就是模块的引用名字
                    moduleName = moduleName + (path.extname(moduleName) ? '' : '.js')
                    moduleName = './' + path.join(parentPath, moduleName)
                    dependencies.push(moduleName)
                    node.arguments = [types.stringLiteral(moduleName)]
                }
            }
        }

        // traverse转换代码
        traverse.default(ast, visitor)

        // 3.generator将AST转回成代码
        const sourceCode = generator.default(ast).code
        
        return { sourceCode, dependencies }
    }

    buildModule(modulePath, isEntry){
        // 拿到模块的内容
        let source = this.getSource(modulePath)
        // 模块id
        const moduleName = './' + path.relative(this.root, modulePath)

        if(isEntry){
            this.entryId = moduleName
        }

        // 解析源码 需要把source源码进行改造 返回一个依赖列表
        const { sourceCode, dependencies } = this.parse(source, path.dirname(moduleName));
        // 把相对路径和模块中的内容 对应起来
        this.modules[moduleName] = sourceCode

        dependencies.forEach(dep => {
            this.buildModule(path.join(this.root, dep))
        })
    }
    emitFile(){
        const main = path.join(this.config.output.path, this.config.output.filename)
        let templateStr = this.getSource(path.join(__dirname, 'tpl.ejs'))
        const code = ejs.render(templateStr, {
            entryId: this.entryId,
            modules: this.modules
        })
        this.assets = {}
        this.assets[main] = code
        fs.writeFileSync(main, this.assets[main])
    }
    run(){
        this.hooks.run.call()
        this.hooks.compile.call();
        // 执行 并且创建模块的依赖关系
        this.buildModule(path.resolve(this.root, this.entry), true)
        this.hooks.afterCompile.call()
        // 发射一个文件 打包后的文件
        this.emitFile()
        this.hooks.emit.call()
        this.hooks.done.call()
    }
}

module.exports = Compiler