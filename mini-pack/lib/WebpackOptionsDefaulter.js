const path = require("path");

const isProductionLikeMode = options => {
	return options.mode ==="production" || !options.mode;
};

const isWebLikeTarget = options => {
	return options.target ==="web" || options.target ==="webworker";
};

const getDevtoolNamespace = library => {
	// if options.output.library is a string
	if (Array.isArray(library)) {
		return library.join(".");
	} else if (typeof library ==="object") {
		return getDevtoolNamespace(library.root);
	}
	return library ||"";
};
const getProperty = (obj, path) => {
	let name = path.split(".");
	for (let i = 0; i < name.length - 1; i++) {
		obj = obj[name[i]];
		if (typeof obj !== "object" || !obj || Array.isArray(obj)) return;
	}
	return obj[name.pop()];
};
const setProperty = (obj, path, value) => {
	let name = path.split(".");
	for (let i = 0; i < name.length - 1; i++) {
		if (typeof obj[name[i]] !== "object" && obj[name[i]] !== undefined) return;
		if (Array.isArray(obj[name[i]])) return;
		if (!obj[name[i]]) obj[name[i]] = {};
		obj = obj[name[i]];
	}
	obj[name.pop()] = value;
};
class WebpackOptionsDefaulter{
    constructor(){
        // Stores configuration for options
        this.config = {
            cache:'make',
            devtool:'make',
            infrastructureLogging:'call',
            module:'call',
            'module.defaultRules': 'make',
            'module.unsafeCache':'make',
            node:'call',
            optimization:'call',
            'optimization.checkWasmTypes':'make',
            'optimization.concatenateModules':'make',
            'optimization.flagIncludedChunks':'make',
            'optimization.minimize':'make',
            'optimization.minimizer':'make',
            'optimization.namedChunks':'make',
            'optimization.namedModules':'make',
            'optimization.nodeEnv':'make',
            'optimization.noEmitOnErrors':'make',
            'optimization.occurrenceOrder':'make',
            'optimization.portableRecords':'make',
            'optimization.removeAvailableModules':'make',
            'optimization.runtimeChunk':'call',
            'optimization.sideEffects':'make',
            'optimization.splitChunks.hidePathInfo':'make',
            'optimization.splitChunks.maxAsyncRequests':'make',
            'optimization.splitChunks.maxInitialRequests':'make',
            'optimization.splitChunks.minSize':'make',
            'optimization.usedExports':'make',
            output:'call',
            'output.chunkCallbackName':'make',
            'output.chunkFilename':'make',
            'output.devtoolNamespace':'make',
            'output.globalObject':'make',
            'output.hotUpdateFunction':'make',
            'output.jsonpFunction':'make',
            'output.pathinfo':'make',
            performance:'call',
            'performance.hints':'make',
            resolve:'call',
            'resolve.aliasFields':'make',
            'resolve.cacheWithContext':'make',
            'resolve.ignoreRootsErrors':'make',
            'resolve.mainFields':'make',
            'resolve.preferAbsolute':'make',
            'resolve.roots':'make',
            resolveLoader:'call',
            'resolveLoader.cacheWithContext':'make',
        };

        // Stores default options settings or functions for computing them
        this.defaults = {
            entry:"./src",
            devtool: options =>
                options.mode ==="development" ?"eval" : false,
            cache: options => options.mode ==="development",
            context: process.cwd(),
            target:"web",
            module: value => Object.assign({}, value),
           "module.unknownContextRequest":".",
           "module.unknownContextRegExp": false,
           "module.unknownContextRecursive": true,
           "module.unknownContextCritical": true,
           "module.exprContextRequest":".",
           "module.exprContextRegExp": false,
           "module.exprContextRecursive": true,
           "module.exprContextCritical": true,
           "module.wrappedContextRegExp": /.*/,
           "module.wrappedContextRecursive": true ,
           "module.wrappedContextCritical": false ,
           "module.strictExportPresence": false ,
           "module.strictThisContextOnImports": false ,
           "module.unsafeCache": options => !!options.cache ,
           "module.rules": [],
           "module.defaultRules": options => [
                {
                    type:"javascript/auto",
                    resolve: {}
                },
                {
                    test: /\.mjs$/i,
                    type:"javascript/esm",
                    resolve: {
                        mainFields:
                            options.target ==="web" ||
                            options.target ==="webworker" ||
                            options.target ==="electron-renderer"
                                ? ["browser","main"]
                                : ["main"]
                    }
                },
                {
                    test: /\.json$/i,
                    type:"json"
                },
                {
                    test: /\.wasm$/i,
                    type:"webassembly/experimental"
                }
            ] ,
            "output": (value, options) => {
                if (typeof value ==="string") {
                    return {
                        filename: value
                    };
                } else if (typeof value !=="object") {
                    return {};
                } else {
                    return Object.assign({}, value)
                }
            } ,
    
            "output.filename":"[name].js" ,
            "output.chunkFilename": options => {
                const filename = options.output.filename;
                if (typeof filename !=="function") {
                    const hasName = filename.includes("[name]");
                    const hasId = filename.includes("[id]");
                    const hasChunkHash = filename.includes("[chunkhash]");
                    // Anything changing depending on chunk is fine
                    if (hasChunkHash || hasName || hasId) return filename;
                    // Elsewise prefix"[id]." in front of the basename to make it changing
                    return filename.replace(/(^|\/)([^/]*(?:\?|$))/,"$1[id].$2");
                }
                return"[id].js";
            },
            "output.webassemblyModuleFilename":"[modulehash].module.wasm" ,
            "output.library":"" ,
            "output.hotUpdateFunction": options => {
                return "webpackHotUpdate"
                // return Template.toIdentifier(
                //    "webpackHotUpdate" + Template.toIdentifier(options.output.library)
                // )
            },
            "output.jsonpFunction": options => {
                return "webpackJsonp"
                // return Template.toIdentifier(
                //    "webpackJsonp" + Template.toIdentifier(options.output.library)
                // )
            } ,
            "output.chunkCallbackName": options => {
                return "webpackChunk"
                // return Template.toIdentifier(
                //    "webpackChunk" + Template.toIdentifier(options.output.library)
                // )
            } ,
            "output.globalObject": options => {
                switch (options.target) {
                    case"web":
                    case"electron-renderer":
                    case"node-webkit":
                        return"window";
                    case"webworker":
                        return"self";
                    case"node":
                    case"async-node":
                    case"electron-main":
                        return"global";
                    default:
                        return"self";
                }
            } ,
            "output.devtoolNamespace": options => {
                return getDevtoolNamespace(options.output.library)
            } ,
           "output.libraryTarget":"var" ,
           "output.path": path.join(process.cwd(),"dist") ,
           "output.pathinfo":options => options.mode ==="development",
           "output.sourceMapFilename":"[file].map[query]" ,
           "output.hotUpdateChunkFilename":"[id].[hash].hot-update.js" ,
           "output.hotUpdateMainFilename":"[hash].hot-update.json" ,
           "output.crossOriginLoading": false ,
           "output.jsonpScriptType": false ,
           "output.chunkLoadTimeout": 120000 ,
           "output.hashFunction":"md4" ,
           "output.hashDigest":"hex" ,
           "output.hashDigestLength": 20 ,
           "output.devtoolLineToLine": false ,
           "output.strictModuleExceptionHandling": false ,
           "node": value => {
                if (typeof value ==="boolean") {
                    return value;
                } else {
                    return Object.assign({}, value);
                }
            },
           "node.console": false,
           "node.process": true ,
           "node.global": true ,
           "node.Buffer": true ,
           "node.setImmediate": true ,
           "node.__filename":"mock" ,
           "node.__dirname":"mock" ,
           "performance": (value, options) => {
                if (value === false) return false;
                if (
                    value === undefined &&
                    (!isProductionLikeMode(options) || !isWebLikeTarget(options))
                )
                    return false;
                return Object.assign({}, value)
            },
           "performance.maxAssetSize": 250000 ,
           "performance.maxEntrypointSize": 250000 ,
           "performance.hints": options =>
                isProductionLikeMode(options) ?"warning" : false,
           "optimization": value => Object.assign({}, value) ,
            // TODO webpack 5: Disable by default in a modes
           "optimization.removeAvailableModules":
                options => options.mode !=="development",
            "optimization.removeEmptyChunks": true ,
            "optimization.mergeDuplicateChunks": true ,
            "optimization.flagIncludedChunks": options =>
                isProductionLikeMode(options),
            // TODO webpack 5 add `moduleIds:"named"` default for development
            // TODO webpack 5 add `moduleIds:"size"` default for production
            // TODO webpack 5 remove optimization.occurrenceOrder
            "optimization.occurrenceOrder": options =>
                isProductionLikeMode(options),
            "optimization.sideEffects": options =>
                isProductionLikeMode(options),
            "optimization.providedExports": true ,
            "optimization.usedExports": options =>
                isProductionLikeMode(options),
            "optimization.concatenateModules": options =>
                isProductionLikeMode(options),
            "optimization.splitChunks": {} ,
            "optimization.splitChunks.hidePathInfo":  options => {
                return isProductionLikeMode(options)
            },
            "optimization.splitChunks.chunks":"async" ,
            "optimization.splitChunks.minSize": options => {
                return isProductionLikeMode(options) ? 30000 : 10000;
            } ,
            "optimization.splitChunks.minChunks": 1 ,
            "optimization.splitChunks.maxAsyncRequests": options => {
                return isProductionLikeMode(options) ? 5 : Infinity;
            } ,
            "optimization.splitChunks.automaticNameDelimiter":"~" ,
            "optimization.splitChunks.automaticNameMaxLength": 109 ,
            "optimization.splitChunks.maxInitialRequests": options => {
                return isProductionLikeMode(options) ? 3 : Infinity;
            } ,
            "optimization.splitChunks.name": true ,
            "optimization.splitChunks.cacheGroups": {} ,
            "optimization.splitChunks.cacheGroups.default": {
                automaticNamePrefix:"",
                reuseExistingChunk: true,
                minChunks: 2,
                priority: -20
            } ,
            "optimization.splitChunks.cacheGroups.vendors": {
                automaticNamePrefix:"vendors",
                test: /[\\/]node_modules[\\/]/,
                priority: -10
            },
            "optimization.runtimeChunk": value => {
                if (value ==="single") {
                    return {
                        name:"runtime"
                    };
                }
                if (value === true || value ==="multiple") {
                    return {
                        name: entrypoint => `runtime~${entrypoint.name}`
                    };
                }
                return value;
            } ,
            "optimization.noEmitOnErrors": options =>
                isProductionLikeMode(options)
             ,
            "optimization.checkWasmTypes": options =>
                isProductionLikeMode(options)
             ,
            "optimization.mangleWasmImports": false ,
            // TODO webpack 5 remove optimization.namedModules
           "optimization.namedModules":
                options => options.mode ==="development",
            "optimization.hashedModuleIds": false ,
            // TODO webpack 5 add `chunkIds:"named"` default for development
            // TODO webpack 5 add `chunkIds:"size"` default for production
            // TODO webpack 5 remove optimization.namedChunks
           "optimization.namedChunks":
                options => options.mode ==="development",
           "optimization.portableRecords":
                options =>
                    !!(
                        options.recordsInputPath ||
                        options.recordsOutputPath ||
                        options.recordsPath
                    ),
            "optimization.minimize":  options =>
                isProductionLikeMode(options)
             ,
            "optimization.minimizer":  options => [
                {
                    apply: compiler => {
                        // Lazy load the Terser plugin
                        const TerserPlugin = require("terser-webpack-plugin");
                        const SourceMapDevToolPlugin = require("./SourceMapDevToolPlugin");
                        new TerserPlugin({
                            cache: true,
                            parallel: true,
                            sourceMap:
                                (options.devtool && /source-?map/.test(options.devtool)) ||
                                (options.plugins &&
                                    options.plugins.some(p => p instanceof SourceMapDevToolPlugin))
                        }).apply(compiler);
                    }
                }
            ],
            "optimization.nodeEnv":  options => {
                // TODO: In webpack 5, it should return `false` when mode is `none`
                return options.mode ||"production";
            } ,
            "resolve":  value => Object.assign({}, value) ,
            "resolve.unsafeCache": true ,
            "resolve.modules": ["node_modules"] ,
            "resolve.extensions": [".wasm", ".mjs", ".js", ".json"] ,
            "resolve.mainFiles": ["index"] ,
            "resolve.aliasFields":  options => {
                if (
                    options.target ==="web" ||
                    options.target ==="webworker" ||
                    options.target ==="electron-renderer"
                ) {
                    return ["browser"];
                } else {
                    return [];
                }
            } ,
            "resolve.mainFields":  options => {
                if (
                    options.target ==="web" ||
                    options.target ==="webworker" ||
                    options.target ==="electron-renderer"
                ) {
                    return ["browser", "module", "main"];
                } else {
                    return ["module", "main"];
                }
            } ,
            "resolve.cacheWithContext":  options => {
                return (
                    Array.isArray(options.resolve.plugins) &&
                    options.resolve.plugins.length > 0
                )
            },
            "resolve.preferAbsolute": 
                options => !options.resolve.roots || options.resolve.roots.length === 0,
            "resolve.ignoreRootsErrors":
                options => !options.resolve.roots || options.resolve.roots.length === 0,
            "resolve.roots":  options => [options.context] ,
            "resolveLoader":  value => Object.assign({}, value) ,
            "resolveLoader.unsafeCache": true ,
            "resolveLoader.mainFields": ["loader", "main"] ,
            "resolveLoader.extensions": [".js", ".json"] ,
            "resolveLoader.mainFiles": ["index"] ,
            "resolveLoader.cacheWithContext":  options => {
                return (
                    Array.isArray(options.resolveLoader.plugins) &&
                    options.resolveLoader.plugins.length > 0
                )
            } ,
            "infrastructureLogging":  value => Object.assign({}, value),
            "infrastructureLogging.level":"info" ,
            "infrastructureLogging.debug": false ,
        }
    }
    process(options){
    	for (let name in this.defaults) {
			switch (this.config[name]) {
				/**
				 * If {@link ConfigType} doesn't specified and current value is `undefined`, then default value will be assigned
				 */
				case undefined:
					if (getProperty(options, name) === undefined) {
						setProperty(options, name, this.defaults[name]);
					}
					break;
				/**
				 * Assign result of {@link CallConfigHandler}
				 */
				case "call":
					setProperty(
						options,
						name,
						this.defaults[name].call(this, getProperty(options, name), options)
					);
					break;
				/**
				 * Assign result of {@link MakeConfigHandler}, if current value is `undefined`
				 */
				case "make":
					if (getProperty(options, name) === undefined) {
						setProperty(options, name, this.defaults[name].call(this, options));
					}
					break;
				/**
				 * Adding {@link AppendConfigValues} at the end of the current array
				 */
				case "append": {
					let oldValue = getProperty(options, name);
					if (!Array.isArray(oldValue)) {
						oldValue = [];
					}
					oldValue.push(...this.defaults[name]);
					setProperty(options, name, oldValue);
					break;
				}
				default:
					throw new Error(
						"OptionsDefaulter cannot process " + this.config[name]
					);
			}
		}
        return options;
    }
}

module.exports = WebpackOptionsDefaulter
