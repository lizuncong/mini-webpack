
const path = require('path')
const { runLoaders } =require('../loader-runner/LoaderRunner')
const OriginalSource = require('../webpack-sources/OriginalSource')
const CachedSource = require('../webpack-sources/CachedSource')
const createHash = require('./util/createHash')
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

// 本质上通过require()引入的文件对应一个NormalModule实例
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
		this.loaders = loaders; // 模块的loaders
        this.dependencies = []; // 模块的依赖
        this._source = null; // OriginalSource的实例，保存的是模块经过loader处理后的源码
        this._chunks = new Set();
        this.index = null;
        this.index2 = null;
        this.id = null;
		if (resolveOptions !== undefined) this.resolveOptions = resolveOptions;
	}
    identifier() {
		return this.request;
	}
    libIdent(options) {
		return "./" + path.posix.relative(options.context, this.userRequest);
	}
    addChunk(chunk) {
		this._chunks.add(chunk);
		return true;
	}
    // 1.执行loader，获取模块经过loader处理后的源码
    // 2.解析源码得到对应的模块依赖
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
                this._initBuildHash(compilation);
                callback();
            }
        )
	}
    _initBuildHash(compilation) {
		const hash = createHash(compilation.outputOptions.hashFunction);
		if (this._source) {
			hash.update("source");
			this._source.updateHash(hash);
		}
		hash.update("meta");
		hash.update(JSON.stringify({}));
		this._buildHash = hash.digest("hex");
	}
    updateHash(hash) {
		hash.update(this._buildHash);
        hash.update(`${this.id}`);
        for (const dep of this.dependencies) dep.updateHash(hash);
	}
    originalSource() {
		return this._source;
	}
    source(dependencyTemplates, runtimeTemplate, type = "javascript") {

		const source = this.generator.generate(
			this,
			dependencyTemplates,
			runtimeTemplate,
			type
		);
		const cachedSource = new CachedSource(source);
		return cachedSource;
	}
}

module.exports = NormalModule;
