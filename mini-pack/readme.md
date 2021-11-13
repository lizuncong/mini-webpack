### Stats对象
这个对象主要包含 modules、 chunks 和 assets 三个属性值的对象
- modules。记录了所有解析后的模块
- chunks。记录了所有chunk
- assets。记录了所有要生成的文件

### webpack.js
- 通过 `NodeEnvironmentPlugin` 设置文件读写系统 compiler.inputFileSystem/compiler.outputFileSystem
- 注册webpack plugins插件
- `WebpackOptionsApply` 初始化 `SingleEntryPlugin`，`SingleEntryPlugin` 注册 `compiler.hooks.make.tapAsync` 钩子，这个钩子做的事情很简单，编译的入口
```js
class SingleEntryPlugin{
    apply(compiler){
        console.log('single')
        compiler.hooks.make.tapAsync('SingleEntryPlugin', (compilation, callback) => {
            const { context, entry, name } = this;
            // 开始从入口文件进行递归编译
            compilation.addEntry(context, entry, name, callback)
        })
    }
}
```

### Compiler