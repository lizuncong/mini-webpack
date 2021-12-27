
class ReplaceSource  {
	constructor(source, name) {
		this._source = source;
		this._name = name;
		/** @type {Replacement[]} */
		this.replacements = [];
	}
}

module.exports = ReplaceSource;
