/**
 * A Chunk is a unit of encapsulation for Modules.
 * Chunks are "rendered" into bundles that get emitted when the build completes.
 */
class Chunk {
	constructor(name) {
		this.name = name;
		console.log('chunk===', name)
	}
}


module.exports = Chunk;