// const { AsyncSeriesWaterfallHook } = require('tapable')

class AsyncSeriesWaterfallHook {
    constructor(args){ // args => ['name']
        this.tasks = [];
    }
    tapAsync(name, task){
        this.tasks.push(task)
    }
    callAsync(...args){
        // const finalCallback = args.pop();
        // let index = 0;
        // const next = (error, param) => {
        //     if(error || index >= this.tasks.length){
        //         finalCallback(error)
        //         return
        //     }
        //     const task = this.tasks[index++]
        //     task(param, next)
        // }
        // const task = this.tasks[index++]
        // task(...args, next)

        // 第二种方法
        const finalCallback = args.pop();
        let index = 0;
        const next = (error, param) => {
            if(error || index >= this.tasks.length){
                finalCallback(error)
                return
            }
            const task = this.tasks[index++]
            task(param, next)
        }
        next('', ...args)
    }
}


class Lesson {
    constructor(){
        this.hooks = {
            arch: new AsyncSeriesWaterfallHook(['name']) // 自定义钩子，
        }
    }
    // 注册监听函数
    tap(){ 
        this.hooks.arch.tapAsync('custom1', (param1, cb) => {
            setTimeout(() => {
                console.log('param1...', param1)
                cb('' , 'test1') // 如果第一个参数不为空，则不会继续执行后面的钩子
            }, 1000)
        })
        this.hooks.arch.tapAsync('custom2', (param2, cb) => {
            setTimeout(() => {
                console.log('param2...', param2)
                cb(null, 'test2');
            }, 2000)
        })
        this.hooks.arch.tapAsync('custom3', (param3, cb) => {
            setTimeout(() => {
                console.log('param3...', param3)
                cb('test3') // 如果传了参数，则不会继续执行后面的钩子
                // cb(undefined, 'test3');
            }, 3000);
        })
        this.hooks.arch.tapAsync('custom4', (param4, cb) => {
            setTimeout(() => {
                console.log('param4...', param4)
                cb('test4')
            }, 4000);
        })
    }
    start(){
        this.hooks.arch.callAsync('jw', (error) => {
            console.log('回调完成...', error)
        })
    }
}

const le = new Lesson()
le.tap(); // 注册事件
le.start();