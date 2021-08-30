const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  mode: "development",
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  watch: true,
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loader')],
    // 别名的方式引用loader
    // alias: {
    //   loader1: path.resolve(__dirname, 'loader', 'loader1.js')
    // }
  },
  module: {
    // loader的分类 pre先执行的  post 后执行的 normal正常顺序执行的，因此实际上loader的顺序是：先执行pre，然后是normal，接着是inline
    // 最后是post
    // normal是正常配置在webpack.config.js里面的loader，inline是指嵌入在源代码里面的loader，比如 const str = require('inline-loader!./a.js')
    // 如果inline-loader前面有-!，则不会让文件再去通过pre 以及 normal loader解析，比如
    // const str = require('-!inline-loader!./a.js')
    // 如果inline loader前面只有!号，则文件不会再通过normal loader解析，比如
    // const str = require('!inline-loader!./a.js')
    // 如果inline loader前面有！！号，则表示文件不再通过其他loader处理，只经过inline loader处理。
    // const str = require('!!inline-loader!./a.js')
    // loader的顺序问题：从右到左，从下到上
    // loader包含两部分，pitchLoader和normalLoader，pitch和normal的执行顺序正好相反，当pitch没有定义
    // 或者没有返回值时，会先依次执行pitch在获取资源执行loader，如果定义的某个pitch有返回值则会跳过读取资源和
    // 自己的loader。假设有use: [loader1，loader2，loader3]，三个loader都包含pitchloader和normal loader。
    // 第一种情况，三个loader的pitch loader都没有返回值，那么执行顺序为：pitch loader3  -> pitch loader2 -> pitch loader1 -> 获取资源 -> normal loader1 ->
    // normal loader2 -> normal loader3
    // 第二种情况，pitch loader有返回值，假设pitch loader2有返回值，则执行顺序为：pitch loader3 -> pitch loader2 -> noraml loader3
    rules: [
      // {
      //   test: /\.js$/,
      //   use: {
      //     loader: 'loader3',
      //   },
      //   // enforce: 'pre'
      // },
      // {
      //   test: /\.js$/,
      //   use: ['loader1', 'loader2', 'pitchLoader'],
      //   // use: path.resolve(__dirname, 'loader', 'loader1.js')
      // },
      // {
      //   test: /\.js$/,
      //   use: [
      //     {
      //       loader: 'mini-babel-loader',
      //       options: {
      //         presets: [
      //           '@babel/preset-env'
      //         ]
      //       }
      //     }
      //   ]
      // },
      {
        test: /\.less$/,
        use: ['mini-style-loader', 'mini-css-loader', 'mini-less-loader']
      },
      {
        test: /\.js$/,
        use: {
          loader: 'banner-loader',
          options: {
            text: '@author lzc',
            filename: path.resolve(__dirname, 'banner.js')
          }
        }
      },
      {
        test: /\.jpg|png$/,
        // 目的就是根据图片生成一个md5 发射到dist目录下，file-loader还会返回当前的
        // 图片路径
        // use: 'file-loader'
        use: {
          loader: 'url-loader',
          options: {
            limit: 200 * 1024,
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './build/index.html',
      filename: 'index.html'
    })
  ]
};