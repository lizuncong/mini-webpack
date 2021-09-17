const loaderUtil = require('loader-utils')
function loader(source){
    const style = `
        let style = document.createElement('style');
        style.innerHTML = ${JSON.stringify(source)};
        document.head.appendChild(style);
    `
    
    return style
}

loader.pitch = function(remainingRequest){
    // 让style-loader去处理less-loader!css-loader/./index.less
    // require路径返回的就是css-loader处理好的结果 require('!!css-loader!less-loader!index.less')
    const style = `
        let style = document.createElement('style');
        style.innerHTML = require(${loaderUtil.stringifyRequest(this,
            '!!' + remainingRequest)});
        document.head.appendChild(style);
    `
    return style
}
module.exports = loader