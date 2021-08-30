// const { AsyncParallelHook } = require('tapable')

class AsyncParallelHook {
    constructor(args){ // args => ['name']
        this.tasks = [];
    }
    tapAsync(name, task){
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
}


class Lesson {
    constructor(){
        this.hooks = {
            arch: new AsyncParallelHook(['name']) // 自定义钩子，
        }
    }
    // 注册监听函数
    tap(){ 
        this.hooks.arch.tapAsync('custom1', (param1, cb) => {
            setTimeout(() => {
                console.log('param1...', param1)
                cb();
            }, 5000)
        })
        this.hooks.arch.tapAsync('custom2', (param2, cb) => {
            setTimeout(() => {
                console.log('param2...', param2)
                cb()
            }, 3000)
        })
        this.hooks.arch.tapAsync('custom3', (param3, cb) => {
            setTimeout(() => {
                console.log('param3...', param3)
                cb()  
            }, 4000);
        })
        this.hooks.arch.tapAsync('custom4', (param4, cb) => {
            setTimeout(() => {
                console.log('param4...', param4)
                cb()
            }, 1000);
        })
    }
    start(){
        this.hooks.arch.callAsync('jw', function(){
            console.log('所有方法执行完毕') // 如果有任何一个tapAsync中的回调cb没有执行，则不会触发最终的回调执行
        })
    }
}

const le = new Lesson()
le.tap(); // 注册事件
le.start();