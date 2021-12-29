### 源码调试
- 新建debugger.js文件，文件名称可以自定义。引入node_modules/webpack/bin/webpack，使用debug模式运行debugger.js即可

### mini-pack目录
这个目录下的代码就是手写的webpack主流程源码。对应的webpack版本为4.46.0，webpack-cli版本为3.3.12。

直接在控制台运行 `node ./mini-pack/cli` 即可。

注意，mini-pack中的源码只是webpack主流程的源码，webpack源码本身除了`架构设计`复杂外，还有`业务层面`更加复杂。主流程源码只是针对简单的
打包场景进行处理，如果遇到打包出错的情况，那么也毫不意外。

一般来说，梳理清楚webpack主流程后，基本上对webpack整体架构都会有个清晰的认识。剩下的就是业务复杂度。如果仅仅是对源码感兴趣，大可不必
深究webpack自身的业务。举个例子，在我手写的过程中，我只是使用了 `index.js`，`test.js`，`a.js`这三个简单的文件进行打包，在真实的webpack
业务中，光是模块解析，即`require('./test.js')`，为了解析 `test.js` 文件的位置，就已经很复杂了。webpack将解析模块的代码单独封装成一个工具包，
即`enhanced-resolve`。

### loaders目录
loaders目录里面都是各种手写loader，目前手写的 loader 有：
- babel-loader
- file-loader
- url-loader
- less-loader 对应的官方less-loader版本5.0.0
- css-loader 对应的官方css-loader版本5.2.7。其中css loader开发稍稍复杂，可以参考 [css loader原理指南](https://github.com/lizuncong/mini-webpack/blob/master/loaders/css-loader/readme.md)
- style-loader 对应的官方style-loader版本2.0.0
- 如果需要查看 loader 基础知识，可以查看[这篇文章](https://github.com/lizuncong/mini-webpack/blob/master/loaders/loader%E6%8C%87%E5%8D%97.md)
- 如果需要了解 plugin 和 loader 的区别，可以查看[这篇文章](https://github.com/lizuncong/Front-End-Development-Notes/blob/master/%E5%89%8D%E7%AB%AF%E7%9F%A5%E8%AF%86%E4%BD%93%E7%B3%BB(%E5%85%A8%E9%9D%A2)/webpack/loader%E5%92%8Cplugin%E7%9A%84%E5%8C%BA%E5%88%AB.md)

### less loader
index.less
```less
@color: red;
@import './common.less';
body{
    background: @color;
    background: url('./2.jpg');
}
```
common.less
```less
img {
    height: 400px;
    overflow: hidden;
}
```
从打包后的源码可以看出，通过 @import xxx.less 引入的less文件，经过less loader打包，不会单独打包成一个独立的xxx.css module。但是通过 @import xxx.css引入的css文件，则会被打包成一个独立的xxx.css module

### plugins目录
plugins目录里面都是各种手写常见的webpack plugin，目前手写的plugin有：
- MediaExtractPlugin。提取CSS文件中多媒体查询CSS并单独打包，在响应式设计系统中能够减少css文件大小，提高加载效率。
- mini-css-extract-plugin 对应的官方版本0.9.0。进行中


### webpack主流程
在手写webpack主流程源码时，主要以下面的demo为例，在src目录下新建三个文件index.j，test.js，a.js
index.js
```javascript
const test = require('./test.js')

console.log(test)
```
test.js
```javascript
const a = require('./a.js')

console.log('a==', a)
console.log('test.js')
module.exports = 'test.js file'
```
a.js
```javascript
console.log('a.js')
module.exports = 'a.js file'
```

webpack.config.js如下:
```javascript
const path = require('path');
module.exports = {
  mode: "development",
  entry: './src/index.js',
  devtool: "none",
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: path.resolve(__dirname, 'loaders', 'loader1'),
        }
      },
    ]
  },
  plugins: []
};
```

#### 理论知识
在阅读webpack源码前，一定要对 `webpack/tapable` 用法非常熟悉。熟悉了 `tapable` 用法后，对于阅读webpack源码难度降低了一半。如果对 `tapable`
不熟，可以看我手写的 [mini-tapable](https://github.com/lizuncong/mini-tapable)

#### 思考以下几个问题
- webpack options默认值是什么时候设置的
- webpack 插件初始化是什么时候设置的
- chunk 和 module的关联是咋样的
- webpack loader的执行时机
- webpack plugin的执行时机
- webpack是如何解析模块的，即当我们通过require('./test.js')引入一个模块后，webpack是如何查找对应的文件的
- webpack如何解析模块依赖的
- webpack如何构建模块
- webpack模版代码如何生成

#### webpack主流程图
当我们运行 `npm run build` 的时候，npm 会从 `./node_modules/webpack/bin/webpack` 开始，找到并执行 `webpack-cli/bin/cli.js`，这就是webpack编译的入口文件


#### 打包阶段
webpack打包可以分为几个阶段
- 初始化options默认值及钩子
- 模块解析
- 打包后的代码生成
### webpack.js
webpack.js主要做的事情如下，其中重点关注下WebpackOptionsApply.js，webpack整个生命周期内的插件基本都在这里初始化
- new WebpackOptionsDefaulter().process(options)。初始化options默认值
- new Compiler(options.context)。初始化compiler实例
- new NodeEnvironmentPlugin().apply(compiler)。为compiler实例设置读写文件系统，这个读写文件系统贯穿整个webpack生命周期
- options.plugins.forEach(plugin => { plugin.apply(compiler) })。注册用户通过webpack.config.js引入的插件
- new WebpackOptionsApply().process(options, compiler)。初始化默认的webpack插件。其中以下插件对于webpack主流程比较重要
  + new EntryOptionPlugin().apply(compiler)。***这是挂载webpack编译的入口点！！！***
    + new SingleEntryPlugin()。*** 监听compiler.hooks.make事件 !!! ***，并且给compilation.dependencyFactories设置对应的moduleFactory
  + 其余插件，可以在阅读webpack源码过程中再慢慢回头看这个文件里面的逻辑。


### compiler.js
逻辑从compiler.js run方法开始看起
- new ResolverFactory()
- new NormalModuleFactory()。这个实例用来解析模块！！所有的模块都会经过这个实例解析
- const compilation = this.newCompilation(params)。初始化compilation实例，为compilation添加normalModuleFactory，这个主要用来创建enhanced-resolver实例，解析模块
- 调用this.hooks.make钩子开始从入口模块编译。这里会从 `SingleEntryPlugin` 注册的插件开始执行，调用 	`compilation.addEntry(context, dep, name, callback)`

### compilation.js
webpack在打包时，会从webpack.config.js指定的entry开始构建模块，对每一个entry，调用compilation.entry方法开始构建。
- addEntry()。添加入口点
  + 往this._preparedEntrypoints中添加entry，_preparedEntrypoints后面生成chunk时会用到.
- _addModuleChain()。