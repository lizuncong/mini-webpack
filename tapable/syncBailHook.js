// const { SyncBailHook } = require('tapable')

class SyncBailHook {
    constructor(args){ // args => ['name']
        this.tasks = [];
    }
    tap(name, task){
        this.tasks.push(task)
    }
    call(...args){
        let ret;
        let index = 0;
        do{
            ret = this.tasks[index++](...args)
        }while(ret === undefined && index < this.tasks.length);
    }
}


class Lesson {
    constructor(){
        this.hooks = {
            arch: new SyncBailHook(['name']) // 自定义钩子，
        }
    }
    // 注册监听函数
    tap(){ 
        this.hooks.arch.tap('custom1', function(param1){
            console.log('param1...', param1)
            // return '停止' // 有返回的话，就不会继续往下执行其他钩子函数
        })
        this.hooks.arch.tap('custom2', function(param2){
            console.log('param2...', param2)
            // return undefined // 只要return的不是undefined，就不会继续往下执行其他钩子
            // return ''
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