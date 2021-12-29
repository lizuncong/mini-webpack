

class Stats {
	constructor(compilation) {
		this.compilation = compilation;
		this.hash = compilation.hash;
		this.startTime = undefined;
		this.endTime = undefined;
	}

	toJson(options, forToString) {
        console.log('自定义webpack打包完成!!!')
	}
}

module.exports = Stats;
