
class Replacement {
	constructor(start, end, content, insertIndex, name) {
		this.start = start;
		this.end = end;
		this.content = content;
		this.insertIndex = insertIndex;
		this.name = name;
	}
}
class ReplaceSource  {
	constructor(source, name) {
		this._source = source;
		this._name = name;
		/** @type {Replacement[]} */
		this.replacements = [];
	}
	replace(start, end, newValue, name) {
		this.replacements.push(new Replacement(start, end, newValue, this.replacements.length, name));
	}
}

module.exports = ReplaceSource;
