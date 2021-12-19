
const { Tapable, } = require("tapable");
const babelParser = require('@babel/parser')
const types = require('@babel/types')
const generator = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const CommonJsRequireDependency = require('./dependencies/CommonJsRequireDependency')
class Parser extends Tapable {
	constructor(options = {}, sourceType = "auto") {
		super();
		this.hooks = {};
		this.options = options;
		this.sourceType = sourceType;
		this.scope = undefined;
		this.state = undefined;
		this.comments = undefined;
	}
	parse(source, initialState){
		const ast = babelParser.parse(source)
		const { module } = initialState
        traverse(ast, {
            CallExpression: (nodePath) => {
                if(nodePath.node.callee.name === 'require'){
                    // 获取当前的节点对象
                    const node = nodePath.node;
					const dep = new CommonJsRequireDependency(node.arguments[0].value)
                    module.dependencies.push(dep)
                }
            }
        })
		return initialState;
	}
}


module.exports = Parser;
