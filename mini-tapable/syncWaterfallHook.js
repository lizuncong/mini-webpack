// const { SyncWaterfallHook } = require('tapable')

class SyncWaterfallHook {
    constructor(args){ // args => ['name']
        this.tasks = [];
    }
    tap(name, task){
        this.tasks.push(task)
    }
    call(...args){
      const [first, ...rest] = this.tasks;
      let ret = first(...args)
      rest.reduce((a, b) => {
        const r = b(a)
        return typeof r === 'undefined' ? a : r
      }, ret)
    }
}


class Lesson {
    constructor(){
        this.hooks = {
            arch: new SyncWaterfallHook(['name']) // 自定义钩子，
        }
    }
    // 注册监听函数
    tap(){ 
        this.hooks.arch.tap('custom1', function(param1){
            console.log('param1...', param1)
            return 'custom1的结果传递给后面的钩子函数' 
        })
        this.hooks.arch.tap('custom2', function(param2){
            console.log('param2...', param2)
            return 'custom2的结果传递给后面的钩子函数'
        })
        this.hooks.arch.tap('custom3', function(param3){
            console.log('param3...', param3)
        })
    }
    start(){
        this.hooks.arch.call('jw')
    }
}

const le = new Lesson()
le.tap(); // 注册事件
le.start();