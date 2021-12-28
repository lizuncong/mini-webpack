
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
	source(options) {
		return this._replaceString(this._source.source());
	}
	_replaceString(str) {
		var result = [str];
		// this.replacements.forEach(function(repl) {
		// 	var remSource = result.pop();
		// 	var splitted1 = this._splitString(remSource, Math.floor(repl.end + 1));
		// 	var splitted2 = this._splitString(splitted1[0], Math.floor(repl.start));
		// 	result.push(splitted1[1], repl.content, splitted2[0]);
		// }, this);

		// write out result array in reverse order
		let resultStr = "";
		for(let i = result.length - 1; i >= 0; --i) {
			resultStr += result[i];
		}
		return resultStr;
	}
}

module.exports = ReplaceSource;
