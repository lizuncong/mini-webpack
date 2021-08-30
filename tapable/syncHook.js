// const { SyncHook } = require('tapable')

class SyncHook {
    constructor(args){ // args => ['name']
        this.tasks = [];
    }
    tap(name, task){
        this.tasks.push(task)
    }
    call(...args){
        this.tasks.forEach(task => task(...args))
    }
}

class Lesson {
    constructor(){
        this.hooks = {
            arch: new SyncHook(['name']) // 自定义钩子，
        }
    }
    // 注册监听函数
    tap(){ 
        this.hooks.arch.tap('custom1', function(param1){
            console.log('param1...', param1)
        })
        this.hooks.arch.tap('custom2', function(param2){
            console.log('param2...', param2)
        })
    }
    start(){
        this.hooks.arch.call('jw')
    }
}

const le = new Lesson()
le.tap(); // 注册事件
le.start();