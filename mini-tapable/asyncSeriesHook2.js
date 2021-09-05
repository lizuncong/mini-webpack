// const { AsyncSeriesHook } = require('tapable')
// 异步串行钩子
class AsyncSeriesHook {
    constructor(args){ // args => ['name']
        this.tasks = [];
    }
    tapPromise(name, task){
        this.tasks.push(task)
    }
    promise(...args){
        // return new Promise((resolve, reject) => {
        //     const next = (i) => {
        //         if(i >= this.tasks.length){
        //             resolve()
        //             return
        //         }
        //         const task = this.tasks[i]
        //         task(...args).then(res => next(i+1), reject)
        //     }
        //     next(0)
        // })
        
        // 第二种方法
        const [first, ...others] = this.tasks;
        return others.reduce((p, n) => {
            return p.then(() => n(...args))
        }, first(...args))
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
        this.hooks.arch.tapPromise('custom1', (param1) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('param1...', param1)
                    resolve()
                }, 1000)
            })
        })
        this.hooks.arch.tapPromise('custom2', (param2) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log('param2...', param2)
                    resolve();
                }, 2000)
            })
        })
        this.hooks.arch.tapPromise('custom3', (param3) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('param3...', param3)
                    // reject('test')  
                    resolve('test3')
                }, 3000);
            })
        })
        this.hooks.arch.tapPromise('custom4', (param4) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log('param4...', param4)
                    resolve('test4')
                }, 4000);
            })
        })
    }
    start(){
        this.hooks.arch.promise('jw').then(resolve => {
            console.log('resolve...', resolve)
        }, error => {
            console.log('error...', error)
        })
    }
}

const le = new Lesson()
le.tap(); // 注册事件
le.start();