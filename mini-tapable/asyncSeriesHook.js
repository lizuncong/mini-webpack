// const { AsyncSeriesHook } = require('tapable')
// 异步串行钩子
class AsyncSeriesHook {
    constructor(args){ // args => ['name']
        this.tasks = [];
    }
    tapAsync(name, task){
        this.tasks.push(task)
    }
    callAsync(...args){
        const finalCallback = args.pop();
        let index = 0
        let next = (error) => {
            if(error || this.tasks.length === index){
                finalCallback(error)
                return;
            }
            let task = this.tasks[index++]
            task(...args, next);
        }
        next()
    }
}


class Lesson {
    constructor(){
        this.hooks = {
            arch: new AsyncSeriesHook(['name']) // 自定义钩子，
        }
    }
    // 注册监听函数
    tap(){ 
        this.hooks.arch.tapAsync('custom1', (param1, cb) => {
                setTimeout(() => {
                    console.log('param1...', param1)
                    // cb('test')
                    cb()
                }, 1000)
        })
        this.hooks.arch.tapAsync('custom2', (param2, cb) => {
                setTimeout(() => {
                    console.log('param2...', param2)
                    cb();
                }, 2000)
        })
        this.hooks.arch.tapAsync('custom3', (param3, cb) => {
                setTimeout(() => {
                    console.log('param3...', param3)
                    // cb()
                    cb(param3)  // 如果传入了参数，则不会继续执行后续的钩子
                }, 3000);
        })
        this.hooks.arch.tapAsync('custom4', (param4, cb) => {
                setTimeout(() => {
                    console.log('param4...', param4)
                    cb('b')
                }, 4000);
        })
    }
    start(){
        this.hooks.arch.callAsync('jw', (error) => {
            console.log('调用完成', error)
        })
    }
}

const le = new Lesson()
le.tap(); // 注册事件
le.start();