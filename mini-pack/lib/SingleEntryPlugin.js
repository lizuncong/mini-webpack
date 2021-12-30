class SingleEntryDependency {
	constructor(request) {
        this.module = null;
		this.weak = false;
		this.optional = false;
		this.loc = undefined;
        this.request = request;
		this.userRequest = request;
	}
}

// 在EntryOptionPlugin中初始化
class SingleEntryPlugin{
    constructor(context, entry, name){
        this.context = context;
        this.entry = entry // 入口文件
        this.name = name // 打包后的dist文件名称，默认main.js
    }
    apply(compiler){
        // 在compiler.newCompilation方法中触发
        compiler.hooks.compilation.tap(
			"SingleEntryPlugin",
			(compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(
					SingleEntryDependency,
					normalModuleFactory
				);
			}
		);
        compiler.hooks.make.tapAsync('SingleEntryPlugin', (compilation, callback) => {
            const { context, entry, name } = this;
            const dep = new SingleEntryDependency(entry);
            dep.loc = { name };
            // 开始从入口文件进行递归编译
            compilation.addEntry(context, dep, name, callback)
        })
    }
}

module.exports = SingleEntryPlugin