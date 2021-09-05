### Tapable
Webpack本质上是一种事件流的机制，它的工作流程就是将各个插件串联起来，而实现这一切的核心就是Tapable，Tapable有点类似于
nodejs的events库，核心原理也是依赖于发布订阅模式。
```js
const {
    SyncHook,
    SyncBailHook,
    SyncWaterfallHook,
    SyncLoopHook,
    AsyncParallelHook,
    AsyncParallelBailHook,
    AsyncSeriesHook,
    AsyncSeriesBailHook,
    AsyncSeriesWaterfallHook
} = require("tapable")
```

tapable库中有三种注册方法：
- 同步注册 tap
- 异步注册 tapAsync(cb)  tapPromise返回的是promise

对应的有三种调用方法：
- 同步调用：call
- 异步调用：callAsync promise

### tapable分类
tapable hook类型可以分为 `同步Sync` 和 `异步Async`，异步又分为 `并行` 和 `串行`

- Basic，比如SyncHook。不关心监听函数的返回值
- Bail。保险式，只要监听函数中有返回值(不为undefined)，则跳过之后的监听函数
- Waterfall。瀑布式，上一步的返回值交给下一步使用
- Loop。循环类型，如果该监听函数返回true，则这个监听函数会反复执行，如果返回undefined则退出循环。