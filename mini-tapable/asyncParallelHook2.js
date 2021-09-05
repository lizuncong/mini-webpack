// const { AsyncParallelHook } = require('tapable')

class AsyncParallelHook {
    constructor(args){ // args => ['name']
        this.tasks = [];
    }
    tapAsync(name, task){
        this.tasks.push(task)
    }
    tapPromise(name, task){
        this.tasks.push(task)
    }
    callAsync(...args){
        const finalCallback = args.pop();
        let count = 0;
        const done = ()=>{
            count++
            if(count === this.tasks.length){
                finalCallback()
            }
        }
        this.tasks.forEach(task => {
            task(...args, done)
        })
    }
    promise(...args){
        const tasks = this.tasks.map(task => task(...args))
        return Promise.all(tasks)
    }
}


class Lesson {
    constructor(){
        this.hooks = {
            arch: new AsyncParallelHook(['name']) // 自定义钩子，
        }
    }
    // 注册监听函数
    tap(){ 
        this.hooks.arch.tapPromise('custom1', (param1) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('param1...', param1)
                    resolve(param1)
                }, 5000)
            })
        })
        this.hooks.arch.tapPromise('custom2', (param2) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('param2...', param2)
                    resolve(param2)
                }, 3000)
            })
        })
        this.hooks.arch.tapPromise('custom3', (param3) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('param3...', param3)
                    resolve(param3)
                }, 4000);
            })
        })
        this.hooks.arch.tapPromise('custom4', (param4) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('param4...', param4)
                    resolve(param4)
                }, 1000);
            })
        })
    }
    start(){
        this.hooks.arch.promise('jw').then((res) => {
            console.log('所有方法执行完成：', res)
        })
    }
}

const le = new Lesson()
le.tap(); // 注册事件
le.start();