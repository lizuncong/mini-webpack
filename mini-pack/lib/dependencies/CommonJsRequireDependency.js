
const DependencyReference = require('./DependencyReference')
class CommonJsRequireDependency {
	constructor(request, range, reqRange) {
        this.request = request;
		this.userRequest = request;
		this.range = range || [];
		this.reqRange = reqRange || []; // webpack源码中为require构造了一个独立的依赖，这里为了方便
		// 我直接存储在CommonJsRequireDependency中
		this.module = null;
	}
	getReference() {
		if (!this.module) return null;
		return new DependencyReference(this.module, true, this.weak);
	}
	updateHash(hash) {
		hash.update((this.module && this.module.id) + "");
	}
}


module.exports = CommonJsRequireDependency;
