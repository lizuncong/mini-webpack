const loaderUtils = require('loader-utils')
const path = require('path')
function loader(source){
    console.log('style..loader', source)
    return source
}

loader.pitch = function loader(request) {
    const options = {}
    const insert = '"head"'
    const injectType = 'styleTag'
    const runtimeOptions = {
        injectType: options.injectType,
        attributes: options.attributes,
        insert: options.insert,
        base: options.base
    };
    switch (injectType) {    
        case 'styleTag':
        case 'singletonStyleTag':
        default:
            const isSingleton = injectType === 'singletonStyleTag';
            const str = `
                import api from ${loaderUtils.stringifyRequest(this, `!${path.join(__dirname, 'runtime/injectStylesIntoStyleTag.js')}`)};
                import content from ${loaderUtils.stringifyRequest(this, `!!${request}`)};
                
                var options = ${JSON.stringify(runtimeOptions)};

                options.insert = ${insert};
                options.singleton = ${isSingleton};
                api(content, options);
                export default content.locals || {};`;
            console.log('my style loader =======\n', str)
            return str
    }
}

module.exports = loader