
const { runLoaders } =require('../loader-runner/LoaderRunner')
const OriginalSource = require('../webpack-sources/OriginalSource')
function dirname(path) {
	if(path === "/") return "/";
	var i = path.lastIndexOf("/");
	var j = path.lastIndexOf("\\");
	var i2 = path.indexOf("/");
	var j2 = path.indexOf("\\");
	var idx = i > j ? i : j;
	var idx2 = i > j ? i2 : j2;
	if(idx < 0) return path;
	if(idx === idx2) return path.substr(0, idx + 1);
	return path.substr(0, idx);
}
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
		resolveOptions,
        context
	}) {
		this.context = dirname(resource);

		// Info from Factory
		this.request = request;
		this.userRequest = userRequest;
		this.rawRequest = rawRequest;
		this.parser = parser;
		this.generator = generator;
		this.resource = resource;
		this.matchResource = matchResource;
		this.loaders = loaders;
        this.dependencies = [];
		if (resolveOptions !== undefined) this.resolveOptions = resolveOptions;
	}
    identifier() {
		return this.request;
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
                this._source = new OriginalSource(source, this.request)
                this._sourceSize = null;
                this._ast = null;
                
                const parseResult = this.parser.parse(
                    this._source.source(),
                    {
                        current: this,
                        module: this,
                        compilation,
                        options
                    }
                )
                callback();
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
