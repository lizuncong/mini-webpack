class SingleEntryPlugin{
    constructor(context, entry, name){
        this.context = context;
        this.entry = entry // 入口文件
        this.name = name // 打包后的dist文件名称，默认main.js
    }
    apply(compiler){
        // compiler.hooks.compilation.tap(
		// 	"SingleEntryPlugin",
		// 	(compilation, { normalModuleFactory }) => {
		// 		compilation.dependencyFactories.set(
		// 			SingleEntryDependency,
		// 			normalModuleFactory
		// 		);
		// 	}
		// );
        compiler.hooks.make.tapAsync('SingleEntryPlugin', (compilation, callback) => {
            const { context, entry, name } = this;
            const dep = {}
            // 开始从入口文件进行递归编译
            compilation.addEntry(context, dep, name, callback)
        })
    }
}

module.exports = SingleEntryPlugin