
const DependencyReference = require('./DependencyReference')
class CommonJsRequireDependency {
	constructor(request, range) {
        this.request = request;
		this.userRequest = request;
		this.range = range;
	}
	getReference() {
		if (!this.module) return null;
		return new DependencyReference(this.module, true, this.weak);
	}
}


module.exports = CommonJsRequireDependency;
