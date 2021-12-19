
const { Tapable, } = require("tapable");

class Parser extends Tapable {
	constructor(options = {}, sourceType = "auto") {
		super();
		this.hooks = {};
		this.options = options;
		this.sourceType = sourceType;
		this.scope = undefined;
		this.state = undefined;
		this.comments = undefined;
	}
}


module.exports = Parser;
