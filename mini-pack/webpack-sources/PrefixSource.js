
var REPLACE_REGEX = /\n(?=.|\s)/g;

class PrefixSource {
	constructor(prefix, source) {
		this._source = source;
		this._prefix = prefix;
	}
	source() {
		var node = typeof this._source === "string" ? this._source : this._source.source();
		var prefix = this._prefix;
		const source = prefix + node.replace(REPLACE_REGEX, "\n" + prefix);
		return source
	}
}


module.exports = PrefixSource;
