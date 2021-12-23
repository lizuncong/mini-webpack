
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
	setRuntimeChunk(chunk) {
		this.runtimeChunk = chunk;
	}

	getRuntimeChunk() {
		return this.runtimeChunk || this.chunks[0];
	}
}

module.exports = Entrypoint;
