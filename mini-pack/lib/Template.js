const ConcatSource = require('../webpack-sources/ConcatSource')
const COMMENT_END_REGEX = /\*\//g;

class Template {

	static asString(str) {
		if (Array.isArray(str)) {
			return str.join("\n");
		}
		return str;
	}

    static indent(s) {
		if (Array.isArray(s)) {
			return s.map(Template.indent).join("\n");
		} else {
			const str = s.trimRight();
			if (!str) return "";
			const ind = str[0] === "\n" ? "" : "\t";
			return ind + str.replace(/\n([^\n])/g, "\n\t$1");
		}
	}
	static toComment(str) {
		if (!str) return "";
		return `/*! ${str.replace(COMMENT_END_REGEX, "* /")} */`;
	}
    static prefix(s, prefix) {
		const str = Template.asString(s).trim();
		if (!str) return "";
		const ind = str[0] === "\n" ? "" : prefix;
		return ind + str.replace(/\n([^\n])/g, "\n" + prefix + "$1");
	}

	/**
	 * @param {Chunk} chunk chunk whose modules will be rendered
	 * @param {ModuleFilterPredicate} filterFn function used to filter modules from chunk to render
	 * @param {ModuleTemplate} moduleTemplate ModuleTemplate instance used to render modules
	 * @param {TODO | TODO[]} dependencyTemplates templates needed for each module to render dependencies
	 * @param {string=} prefix applying prefix strings
	 * @returns {ConcatSource} rendered chunk modules in a Source object
	 */
	static renderChunkModules(
		chunk,
		filterFn,
		moduleTemplate,
		dependencyTemplates,
		prefix = ""
	) {
		const source = new ConcatSource();
		const modules = chunk.getModules();
		const allModules = modules.map(module => {
			return {
				id: module.id,
				source: moduleTemplate.render(module, dependencyTemplates, {
					chunk
				})
			};
		});
		// Render an object
		source.add("{\n");
		allModules.forEach((module, idx) => {
			if (idx !== 0) {
				source.add(",\n");
			}
			source.add(`\n/***/ ${JSON.stringify(module.id)}:\n`);
			source.add(module.source);
		});
		source.add(`\n\n${prefix}}`);
	
		return source;
	}
}

module.exports = Template;
