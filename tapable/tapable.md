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