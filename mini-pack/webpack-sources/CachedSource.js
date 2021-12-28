
class CachedSource {
	constructor(source) {
		this._source = source;
		this._cachedSource = undefined;
		this._cachedSize = undefined;
		this._cachedMaps = {};
	}

	source() {
		return this._source.source();
	}
}

module.exports = CachedSource;
