
class DependencyReference {
	constructor(module, importedNames, weak = false, order = NaN) {
		this.module = module;
		this.importedNames = importedNames;
		this.weak = !!weak;
		this.order = order;
	}
}

module.exports = DependencyReference;
