function createLoaderObject({loader}) {
	var obj = {
		path: loader,
        request: loader,
		query: "",
		options: null,
		ident: null,
		normal: null,
		pitch: null,
		raw: null,
		data: null,
		pitchExecuted: false,
		normalExecuted: false
	};
	obj.request = loader;
	return obj;
}
exports.runLoaders = function runLoaders(options, callback) {
    const loaderContext = options.context || {};
    const loaders = (options.loaders || []).map(createLoaderObject)
    let resourceBuffer = null
    loaders.forEach(loader => {
        loader.module = require(loader.path)
    })
    options.readResource(options.resource, (err, buffer) => {
        resourceBuffer = buffer;
        const resourceStr = resourceBuffer.toString('utf-8');
        let result = [resourceStr];
        loaders.forEach(loader => {
            const fn = loader.module;
            result = [(function LOADER_EXECUTION() {
                return fn.apply(loaderContext, result);
            }())]; 
        })
        callback(null, {
            result,
            resourceBuffer,
        })
    })

};
