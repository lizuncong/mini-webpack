### 前置知识
- [postcss插件开发基础](https://github.com/postcss/postcss/blob/main/docs/writing-a-plugin.md)。不需要了解太深入，了解基础便于阅读源码。
- [webpack loader开发基础](https://webpack.js.org/contribute/writing-a-loader/)

### 示例代码
本篇所有讲解基于下面的 `index.css` 以及 `common.css` 文件：
index.css:
```css
body{
    color: blue;
    background: yellow;
    background: url('./2.png');
}
@import './common.css';
.container{
    color: red;
    background: url(./2.jpg);
}
```
common.css:
```css
div {
    height: 200px;
    color: red;
    overflow: hidden;
}
```
webpack.config.js文件：
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  mode: "development",
  entry: './src/index.js',
  devtool: "source-map",
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: path.resolve(__dirname, 'loaders', 'babel-loader'),
          options: {
            presets: [
              '@babel/preset-env'
            ]
          }
        }
      },
      {
        test: /\.(png|jpg)$/,
        use: path.resolve(__dirname, 'loaders', 'file-loader')
      },
      {
        test: /\.css$/,
        use: [
          path.resolve(__dirname, 'loaders', 'css-loader'),
          // {
          //   loader: 'css-loader',
          //   options: {
          //     sourceMap: false
          //   }
          // },
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html"
    })
  ]
};
```

由于还没引入 style loader，因此需要在index.js文件中手动引用 css loader 打包的结果

index.js文件
```javascript
const css = require('./index.css')
console.log('css...module', css)
console.log('css...', css.default.toString())
const ele = document.createElement('div')
ele.innerHTML = 'hello world';
document.body.appendChild(ele)
const styleEle = document.createElement('style')
styleEle.appendChild(document.createTextNode(css.default.toString()))
document.head.appendChild(styleEle)
```
### css loader原理
css loader用于解析css文件中 `@import`、`url()`等语法。将其解析成通过 `import/require()`引入的模块。css loader使用 `postcss` 将css源码转换成抽象语法树，通过 `AtRule` 监听 `@import` 规则，通过 `Declaration` 监听值包含 `url()` 的
声明。

### css loader最终输出结果是个啥
index.css 经过 css loader 处理后，结果如下：
```javascript
// Imports
import ___CSS_LOADER_API_IMPORT___ from "../loaders/css-loader/runtime/api.js";
import ___CSS_LOADER_AT_RULE_IMPORT_0___ from "./common.css";
import ___CSS_LOADER_GET_URL_IMPORT___ from "../loaders/css-loader/runtime/getUrl.js";
import ___CSS_LOADER_URL_IMPORT_0___ from "./2.png";
import ___CSS_LOADER_URL_IMPORT_1___ from "./2.jpg";
var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});
___CSS_LOADER_EXPORT___.i(___CSS_LOADER_AT_RULE_IMPORT_0___);
var ___CSS_LOADER_URL_REPLACEMENT_0___ = ___CSS_LOADER_GET_URL_IMPORT___(___CSS_LOADER_URL_IMPORT_0___);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = ___CSS_LOADER_GET_URL_IMPORT___(___CSS_LOADER_URL_IMPORT_1___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "body{\n    color: blue;\n    background: yellow;\n    background: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n}\n\n.container{\n    color: red;\n    background: url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ");\n}\n\n", ""]);
// Exports
export default ___CSS_LOADER_EXPORT___;
```

common.css 经过 css loader 处理后，结果如下：
```javascript
// Imports
import ___CSS_LOADER_API_IMPORT___ from "../loaders/css-loader/runtime/api.js";
var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, "div {\n    height: 200px;\n    color: red;\n    overflow: hidden;\n}\n", ""]);
// Exports
export default ___CSS_LOADER_EXPORT___;
```

经过css loader处理的css文件，最终导出的是一个数组 `list`，也就是上面的 `___CSS_LOADER_EXPORT___`。list是一个二维数组，`list[i]`第一项固定为 css 模块的id，默认为 `@import`的路径。
`list[i]` 第二项固定为 css 模块的源码。


在index.css文件中，通过@import引用了common.css，因此可以看出经过css loader处理后，index.css 的 @import 源码被解析成
```javascript
import ___CSS_LOADER_AT_RULE_IMPORT_0___ from "./common.css";
```
并通过
```javascript
___CSS_LOADER_EXPORT___.i(___CSS_LOADER_AT_RULE_IMPORT_0___);
```
往index.css的list中添加一个模块。

`background: url(./2.jpg);` 以及 `background: url('./2.png');` 被解析成
```javascript
import ___CSS_LOADER_URL_IMPORT_0___ from "./2.png";
import ___CSS_LOADER_URL_IMPORT_1___ from "./2.jpg";

var ___CSS_LOADER_URL_REPLACEMENT_0___ = ___CSS_LOADER_GET_URL_IMPORT___(___CSS_LOADER_URL_IMPORT_0___);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = ___CSS_LOADER_GET_URL_IMPORT___(___CSS_LOADER_URL_IMPORT_1___);
```

然后通过 `background: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ")`引用


如果我们在index.js中打印index.css的输出，会得到：
```javascript
`div {
    height: 200px;
    color: red;
    overflow: hidden;
}
body{
    color: blue;
    background: yellow;
    background: url(2.131f3c4fe7dda6ea7686ecff63b51db8.png);
}
.container{
    color: red;
    background: url(2.e85ae876a8234ed3870b97aede7595e0.jpg);
}`
```
可以看出，不论 `@import` 出现在 `index.css` 中的什么位置，`common.css` 模块的代码都在 `index.css` 上面。


#### @import规则的处理