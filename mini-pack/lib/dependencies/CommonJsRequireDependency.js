
const DependencyReference = require('./DependencyReference')
class CommonJsRequireDependency {
	constructor(request, range) {
        this.request = request;
		this.userRequest = request;
		this.range = range;
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
