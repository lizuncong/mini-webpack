// const { SyncLoopHook } = require('tapable')

class SyncLoopHook {
    constructor(args){ // args => ['name']
        this.tasks = [];
    }
    tap(name, task){
        this.tasks.push(task)
    }
    call(...args){
        this.tasks.forEach((task, index) => {
            let ret;
            ret = task(...args)
            while(ret !== undefined){
                this.tasks.slice(0, index).forEach(t => {t(...args)})
                ret = task(...args)
            }
        })
    }
}


class Lesson {
    constructor(){
        this.index = 0;
        this.hooks = {
            arch: new SyncLoopHook(['name']) // 自定义钩子，
        }
    }
    // 注册监听函数
    tap(){ 
        let idx = 0
        this.hooks.arch.tap('custom1', (param1) => {
            console.log('param1...', param1)
            // return undefined
        })
        this.hooks.arch.tap('custom2', (param2) => {
            console.log('param2...', idx, param2)
            return ++idx > 2 ? undefined : 'custom2钩子会循环执行3遍...'
        })
        this.hooks.arch.tap('custom3', (param3) => {
            console.log('param3...', this.index, param3)
            return ++this.index === 3 ? undefined : '这个钩子会执行3遍'
        })
        this.hooks.arch.tap('custom4', (param4) => {
            console.log('param4...', param4)
        })
    }
    start(){
        this.hooks.arch.call('jw')
    }
}

const le = new Lesson()
le.tap(); // 注册事件
le.start();