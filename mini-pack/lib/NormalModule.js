
const { runLoaders } =require('../loader-runner/LoaderRunner')
class NormalModule {
	constructor({
		type,
		request,
		userRequest,
		rawRequest,
		loaders,
		resource,
		matchResource,
		parser,
		generator,
		resolveOptions
	}) {

		// Info from Factory
		this.request = request;
		this.userRequest = userRequest;
		this.rawRequest = rawRequest;
		this.parser = parser;
		this.generator = generator;
		this.resource = resource;
		this.matchResource = matchResource;
		this.loaders = loaders;
		if (resolveOptions !== undefined) this.resolveOptions = resolveOptions;
	}
	build(options, compilation, resolver, fs, callback){
        const loaderContext = {
            rootContext: options.context, 
            _compilation: compilation,
			_compiler: compilation.compiler,
            fs,
        }
        runLoaders(
            {
                resource: this.resource,
                loaders: this.loaders,
                context: loaderContext,
                readResource: fs.readFile.bind(fs)
            },
            (err, result) => {
                const resourceBuffer = result.resourceBuffer;
				const source = result.result[0];
                console.log('build==', source)
            }
        )
	}
	// build(options, compilation){
    //     // 现在开始编译入口模块了
    //     const originalSource = compilation.inputFileSystem.readFileSync(this.request, 'utf8');
    //     const ast = babelParser.parse(originalSource)
    //     const dependencies = [];
    //     traverse(ast, {
    //         CallExpression: (nodePath) => {
    //             if(nodePath.node.callee.name === 'require'){
    //                 // 获取当前的节点对象
    //                 const node = nodePath.node;
    //                 node.callee.name = '__webpack_require__'
    //                 const moduleName = node.arguments[0].value
    //                 const extname = moduleName.split(path.posix.sep).pop().indexOf('.') === -1 ? '.js' : '';
    //                 // 获取依赖模块的绝对路径
    //                 const dependencyRequest = path.posix.join(path.posix.dirname(this.request), moduleName+extname)
    //                 // 获取依赖模块的id
    //                 const dependencyModuleId = './' + path.posix.relative(this.context, dependencyRequest)

    //                 dependencies.push({
    //                     name: this.name, // 此模块所属的代码块的名字
    //                     context: this.context,
    //                     request: dependencyRequest
    //                 })
    //                 // 把参数从./title.js改为./src/title.js
    //                 node.arguments = [types.stringLiteral(dependencyModuleId)]
    //             }
    //         }
    //     })

    //     const {code} = generator(ast)
    //     this._ast = ast;
    //     this._source = code;
    //     this.moduleId = './' + path.posix.relative(this.context, this.request)
    //     compilation.modules.push(this)
    //     compilation._modules[this.request] = this;
    //     // this.dependencies = dependencies
    //     compilation.buildDependencies(this, dependencies)
    //     return this
    // }
}

module.exports = NormalModule;
