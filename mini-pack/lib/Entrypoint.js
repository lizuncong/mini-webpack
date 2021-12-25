
/**
 * Entrypoint serves as an encapsulation primitive for chunks that are
 * a part of a single ChunkGroup. They represent all bundles that need to be loaded for a
 * single instance of a page. Multi-page application architectures will typically yield multiple Entrypoint objects
 * inside of the compilation, whereas a Single Page App may only contain one with many lazy-loaded chunks.
 */
class Entrypoint {
	constructor(name) {
		this.runtimeChunk = undefined;
        this.origins = [];
        this.chunks = [];
		// 索引，从上到下
		this._moduleIndices = new Map();
		// 索引，从下到上
		this._moduleIndices2 = new Map();
	}
    pushChunk(chunk) {
		this.chunks.push(chunk);
		return true;
	}
    addOrigin(module, loc, request) {
		this.origins.push({
			module,
			loc,
			request
		});
	}
	setModuleIndex(module, index) {
		this._moduleIndices.set(module, index);
	}
	getModuleIndex(module) {
		return this._moduleIndices.get(module);
	}
	setModuleIndex2(module, index) {
		this._moduleIndices2.set(module, index);
	}
	getModuleIndex2(module) {
		return this._moduleIndices2.get(module);
	}
	setRuntimeChunk(chunk) {
		this.runtimeChunk = chunk;
	}

	getRuntimeChunk() {
		return this.runtimeChunk || this.chunks[0];
	}
}

module.exports = Entrypoint;
