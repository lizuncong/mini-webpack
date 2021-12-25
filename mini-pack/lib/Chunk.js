/**
 * A Chunk is a unit of encapsulation for Modules.
 * Chunks are "rendered" into bundles that get emitted when the build completes.
 */
class Chunk {
	constructor(name) {
		this.id = null;
		this.name = name;
		this.entryModule = undefined;
		this._groups = new Set();
		this._modules = new Set();
	}
	addGroup(chunkGroup) {
		this._groups.add(chunkGroup);
		return true;
	}
	addModule(module) {
		this._modules.add(module);
		return true;
	}
	updateHash(hash) {
		hash.update(`${this.id} `);
		hash.update(`${this.name || ""} `);
		for (const m of this._modules) {
			hash.update(m.hash);
		}
	}
}


module.exports = Chunk;
