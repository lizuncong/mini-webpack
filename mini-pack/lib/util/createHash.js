class BulkUpdateDecorator {
	constructor(hash) {
		this.hash = hash;
		this.buffer = "";
	}
	update(data, inputEncoding) {
        this.buffer += data;
		return this;
	}
	digest(encoding) {
		if (this.buffer.length > 0) {
			this.hash.update(this.buffer);
		}
		var digestResult = this.hash.digest(encoding);
		return typeof digestResult === "string"
			? digestResult
			: digestResult.toString();
	}
}

module.exports = (algorithm) => {
	return new BulkUpdateDecorator(require("crypto").createHash(algorithm));
};
