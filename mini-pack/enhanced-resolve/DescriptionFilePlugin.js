
const path = require('path')
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
					const directory = request.descriptionFileRoot || request.path;
					const pkgFilename = this.filenames[0]
					const descriptionFilePath =  path.join(directory, pkgFilename)
					resolver.fileSystem.readFile(descriptionFilePath, (err, buffer) => {
						if (err) return callback(err);
						const data = JSON.parse(buffer.toString("utf-8"));
						const obj = {
							...request,
							descriptionFilePath: descriptionFilePath,
							descriptionFileData: data,
							descriptionFileRoot: directory,
							relativePath: '.'
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
								// TODO
								// console.log('target.name', target.name)
							}
						)
						
					})
				}
			);
	}
};
