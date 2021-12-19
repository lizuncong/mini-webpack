
class OriginalSource {
	constructor(value, name) {
		this._value = value;
		this._name = name;
	}
    source() {
		return this._value;
	}
}


module.exports = OriginalSource;
