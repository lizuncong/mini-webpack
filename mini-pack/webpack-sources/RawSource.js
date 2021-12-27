
class RawSource {
	constructor(value) {
		this._value = value;
	}

	source() {
		return this._value;
	}
}

module.exports = RawSource;
