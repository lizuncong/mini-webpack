
const path = require('path')
const { cdUp } = require('./DescriptionFileUtils')
module.exports = class DescriptionFilePlugin {
	constructor(source, filenames, target) {
		this.source = source; // parsedResolve 钩子
		this.filenames = [].concat(filenames); // ["package.json"]
		this.target = target; // describedResolve 钩子
	}

	apply(resolver) {
		const target = resolver.ensureHook(this.target);
		resolver
			.getHook(this.source)
			.tapAsync(
				"DescriptionFilePlugin",
				(request, resolveContext, callback) => {
					let directory = request.descriptionFileRoot || request.path;
					const pkgFilename = this.filenames[0]
					let descriptionFilePath =  path.join(directory, pkgFilename)
					const readPkgJSONFile = (filePath, callback) => {
						resolver.fileSystem.readFile(filePath, (err, buffer) => {
							if (err) {
								// console.error('读取package.json文件失败', err.code)
								directory = cdUp(directory)
								descriptionFilePath = path.join(directory, pkgFilename)
								readPkgJSONFile(descriptionFilePath, callback)
								return;
							};	
							callback(buffer)
						})
					}

					readPkgJSONFile(descriptionFilePath, buffer => {
						const data = JSON.parse(buffer.toString("utf-8"));
						const obj = {
							...request,
							descriptionFilePath: descriptionFilePath,
							descriptionFileData: data,
							descriptionFileRoot: directory,
							relativePath: "." + request.path
								.substr(directory.length)
								.replace(/\\/g, "/")
						}
						if(request.request && request.request.indexOf('./test') > -1){
							console.log('obj===', obj)
						}
						// 交给describedResolve钩子处理，这个钩子会按顺序跑下面的钩子
						// 1.先跑AliasFieldPlugin, 经过aliasFieldPlugin处理后
						// 2.再跑40个AliasPlugin，这个对主流程没什么处理
						// 3.其次跑ModuleKindPlugin，这个对主流程没什么处理
						// 4.完了跑JoinRequestPlugin，这个主要是处理path，relativePath，并调用resolver.doResolve继续解析
						// console.log('DescriptionFilePlugin===', target)
						// 5.最后跑RootPlugin
						resolver.doResolve(
							target,
							obj,
							resolveContext,
							(err, result) => {
								if(err) return callback(err);
								callback(null, result)
							}
						)
					})
				}
			);
	}
};
