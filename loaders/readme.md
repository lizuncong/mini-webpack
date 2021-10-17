### loader的引入方式
#### 第一种引入方式：使用resolveLoader.modules告诉webpack在哪里查找loader
```js
module.exports = {
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
  module: {
    rules: [
       {
         test: /\.js$/,
         use: 'loader1',
       },
    ]
  }
};
```
#### 第二种引入方式：使用resolveLoader.alias别名方式
```js
module.exports = {
  resolveLoader: {
     alias: {
       loader1: path.resolve(__dirname, 'loaders', 'loader1.js')
     },
  },
  module: {
    rules: [
       {
         test: /\.js$/,
         use: 'loader1',
       },
    ]
  }
};
```
#### 第三种引入方式：直接使用path.resolve指定loader位置
```js
module.exports = {
  module: {
    rules: [
       {
         test: /\.js$/,
         use: path.resolve(__dirname, 'loaders', 'loader1.js'),
       },
    ]
  }
};
```

### loader执行时机
#### 默认情况下，loader从下往上，从右到左依次执行
从右往左依次执行，先loader1，其次loade2，最后loader3
```js
module.exports = {
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
  module: {
    rules: [
       {
         test: /\.js$/,
         use: ['loader3', 'loader2', 'loader1'],
       },
    ]
  }
};
```
从下往上依次执行，先loader3，其次loader2，最后loader1
```js
module.exports = {
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'loader1',
      },
      {
        test: /\.js$/,
        use: 'loader2',
      },     
      {
        test: /\.js$/,
        use: 'loader3',
      },
    ]
  }
};
```
#### 可以通过enforce改变loader的执行顺序
loader将按照如下方式依次执行

`pre loader` -> `normal loader` -> `inline loader` -> `post loader`。

`loader1`以及`loader3`没有配置`enforce`属性，因此是`normal loader`。

下面loader的执行顺序是：loader2 -> loader3 -> loader1 -> loader4
```js
module.exports = {
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'loader1',
      },
      {
        test: /\.js$/,
        use: 'loader2',
        enforce: "pre"
      },
      {
        test: /\.js$/,
        use: 'loader3',
      },
      {
        test: /\.js$/,
        use: 'loader4',
        enforce: "post"
      },
    ]
  }
};
```

#### inline loader执行顺序



因此，loader的执行顺序是：

`pre loader` -> `normal loader` -> `inline loader` -> `post loader`。

`pre loader` 就是 `enforce: 'pre'` 的loader。

`normal loader` 就是没有配置 `enforce` 的正常loader。

`inline loader` 就是通过内联方式引入的loader。

`post loader` 就是配置 `enforce: 'post'` 的loader。

`inline loader`的使用方式不同，也会改变loader的顺序：

- 如果`inline loader`前面只有`!`号，则文件不会再通过配置的`normal loader`解析
```javascript
import Styles from '!style-loader!css-loader?modules!./styles.css';
```
- 如果`inline loader`前面有`!!`号，则表示文件不再通过其他loader处理，只经过inline loader处理。
```javascript
import Styles from '!!style-loader!css-loader?modules!./styles.css';
```
- 如果`inline-loader`前面有`-!`，则不会让文件再去通过`pre loader` 以及 `normal loader`解析，但还是会经过`post loader`解析
```javascript
import Styles from '-!style-loader!css-loader?modules!./styles.css';
```

#### loader的组成
loader包含两部分，pitchLoader和normalLoader，pitch和normal的执行顺序正好相反
- 当pitch没有定义或者没有返回值时，会先依次执行pitch在获取资源执行loader
- 如果定义的某个pitch有返回值则会跳过读取资源和自己的loader。假设有use: [loader1，loader2，loader3]，三个loader都包含pitchloader和normal loader。
    + 第一种情况，三个loader的pitch loader都没有返回值，那么执行顺序为：pitch loader3  -> pitch loader2 -> pitch loader1 -> 获取资源 -> normal loader1 ->
    normal loader2 -> normal loader3
    + 第二种情况，pitch loader有返回值，假设pitch loader2有返回值，则执行顺序为：pitch loader3 -> pitch loader2 -> noraml loader3
    
```javascript
function loader(source){
    console.log('pitchLoader...', source)
}

loader.pitch = function(){
    console.log('pitch...')
}

module.exports = loader
```
