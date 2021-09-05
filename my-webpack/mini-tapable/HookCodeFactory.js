class HookCodeFactory {
    setup(hookInstance, options){
        this.options = options;
        hookInstance._x = options.taps.map(item => item.fn)
    }

    header(){
        return `
            "use strict";
            var _context;
            var _x = this._x; // fn的数组 监听 函数的数组
        `
    }
    content(){
        let code = '';
        for(let index=0; i < this.options.taps.length;i++){
            code += `
                var _fn${index} = _x[${index}];
                _fn${index}(${options._args.join(',')})
            `
        }
        return code;
    }
    create(options){
        return new Function(options._args.join(','), this.header() + this.content())
    }
}

module.exports = HookCodeFactory;