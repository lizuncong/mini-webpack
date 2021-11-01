const loaderUtils = require('loader-utils')
const path = require('path')
function loader(source){
    console.log('style-loader...', source)
    return source
}

loader.pitch = function loader(request) {
    const options = {}
    const insert = '"head"'
    const injectType = 'styleTag'
    const esModule = true
    const namedExport = undefined
    const runtimeOptions = {
        injectType: options.injectType,
        attributes: options.attributes,
        insert: options.insert,
        base: options.base
    };
    console.log('__dirName======\n', __dirname)
    switch (injectType) {    
        case 'styleTag':
        case 'singletonStyleTag':
        default:
            const isSingleton = injectType === 'singletonStyleTag';
            // const str =  `
            //     import api from "!../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js";
            //     import content from "!!../node_modules/css-loader/dist/cjs.js??ref--7-1!./index.css";
            //     var options = {};
            //     options.insert = "head";
            //     options.singleton = false;
            //     var update = api(content, options);
            //     export default content.locals || {};`
            // ========== my style loader =======
//             import api from "!../loaders/style-loader/runtime/injectStylesIntoStyleTag.js";
//             import content from "!!../node_modules/css-loader/dist/cjs.js??ref--7-1!./index.css";
            
//             var options = {};

//             options.insert = "head";
//             options.singleton = false;
// ß
//             var update = api(content, options);
//             export default content.locals || {};
            const str = `
                import api from ${loaderUtils.stringifyRequest(this, `!${path.join(__dirname, 'runtime/injectStylesIntoStyleTag.js')}`)};
                import content from ${loaderUtils.stringifyRequest(this, `!!${request}`)};
                
                var options = ${JSON.stringify(runtimeOptions)};

                options.insert = ${insert};
                options.singleton = ${isSingleton};
    ß
                var update = api(content, options);
                export default content.locals || {};`;
            console.log('my style loader =======\n', str)
            return str
    }
}

module.exports = loader


// function loader(source){
//     const style = `
//         let style = document.createElement('style');
//         style.innerHTML = ${JSON.stringify(source)};
//         document.head.appendChild(style);
//     `
    
//     return style
// }

// loader.pitch = function(remainingRequest){
//     // 让style-loader去处理less-loader!css-loader/./index.less
//     // require路径返回的就是css-loader处理好的结果 require('!!css-loader!less-loader!index.less')
//     const style = `
//         let style = document.createElement('style');
//         style.innerHTML = require(${loaderUtil.stringifyRequest(this,
//             '!!' + remainingRequest)});
//         document.head.appendChild(style);
//     `
//     return style
// }
// module.exports = loader