
const Template = require('../Template')
class ModuleDependencyTemplateAsId {
        apply(dep, source, runtime) {
                const content = `${Template.toComment(dep.request)}${JSON.stringify(dep.module.id)}`
                // 在webpack源码中,ReplaceSource.replacements数组中存放的是
                // 要替换的标志。以：const test = require('./test.js')\n\nconsole.log(test)\n为例，
                // 数组第一项存放的是'./test.js'的起始位置，这个会被替换成content
                // 数组第二项存放的是require的起始位置，require会被替换成__webpack_require__
                source.replace(dep.range[0], dep.range[1] - 1, content);
                source.replace(dep.reqRange[0], dep.reqRange[1] - 1, '__webpack_require__');
	}
}
module.exports = ModuleDependencyTemplateAsId;
