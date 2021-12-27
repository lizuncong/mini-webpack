

class ConcatSource {
	constructor() {
		this.children = [];
	}

	add(item) {
		if(item instanceof ConcatSource) {
			var children = item.children;
			for(var j = 0; j < children.length; j++)
				this.children.push(children[j]);
		} else {
			this.children.push(item);
		}
	}
}


module.exports = ConcatSource;
