const path = require('path')
const fs = require('fs')
const babelParser = require('@babel/parser')
const types = require('@babel/types')
const generator = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const ejs = require('ejs')
class NormalModule {
    constructor({ name, request, context }){
        this.name = name;
        this.context = context;
        this.request = request; // 模块的绝对路径
        this.dependencies = []; // 这里放的是依赖的模块数组
        this.moduleId; // 模块id
        this._ast; // 本模块的抽象语法树
        this._source; // 源代码
    }
    build(compilation){
        // 现在开始编译入口模块了
        const originalSource = compilation.inputFileSystem.readFileSync(this.request, 'utf8');
        const ast = babelParser.parse(originalSource)
        const dependencies = [];
        traverse(ast, {
            CallExpression: (nodePath) => {
                if(nodePath.node.callee.name === 'require'){
                    // 获取当前的节点对象
                    const node = nodePath.node;
                    node.callee.name = '__webpack_require__'
                    const moduleName = node.arguments[0].value
                    const extname = moduleName.split(path.posix.sep).pop().indexOf('.') === -1 ? '.js' : '';
                    // 获取依赖模块的绝对路径
                    const dependencyRequest = path.posix.join(path.posix.dirname(this.request), moduleName+extname)
                    // 获取依赖模块的id
                    const dependencyModuleId = './' + path.posix.relative(this.context, dependencyRequest)

                    dependencies.push({
                        name: this.name, // 此模块所属的代码块的名字
                        context: this.context,
                        request: dependencyRequest
                    })
                    // 把参数从./title.js改为./src/title.js
                    node.arguments = [types.stringLiteral(dependencyModuleId)]
                }
            }
        })

        const {code} = generator(ast)
        this._ast = ast;
        this._source = code;
        this.moduleId = './' + path.posix.relative(this.context, this.request)
        compilation.modules.push(this)
        compilation._modules[this.request] = this;
        // this.dependencies = dependencies
        compilation.buildDependencies(this, dependencies)
        return this
    }
}

module.exports = NormalModule