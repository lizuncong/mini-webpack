/**
 * rules: [
  { type: 'javascript/auto', resolve: {} },
  {
    test: /\.mjs$/i,
    type: 'javascript/esm',
    resolve: { mainFields: [Array] }
  },
  { test: /\.json$/i, type: 'json' },
  { test: /\.wasm$/i, type: 'webassembly/experimental' },
  {
    test: /\.js$/,
    use: {
      loader: '/Users/lizuncong/Documents/手写源码系列/mini-webpack/loaders/loader1'
    }
  }
]
 * **/

module.exports = class RuleSet {
	constructor(rules) {
		this.references = Object.create(null);
        const ident = "ref-"
        this.rules = rules.map((rule, idx) => {
            const id = `${ident}-${idx}`
            const newRule = {};
            const condition = rule.test;
            if(condition){
                newRule.resource = condition.test.bind(condition)
            }
            const item = rule.use;
            if(item){
                const newItem = {}
                Object.keys(item).filter(function(key) {
                    return !["options", "query"].includes(key);
                }).forEach(key => {
                    newItem[key] = item[key]
                })
                newRule.use = [newItem]
            }
            Object.keys(rule).filter(key => {
                return !['test', 'use'].includes(key)
            }).forEach(key => {
                newRule[key] = rule[key]
            })
            return newRule;
        })
    }
    exec(data){
        const result = [];
        this.rules.forEach(rule => {
            if (rule.resource && !rule.resource(data.resource)) return false;
            const keys = Object.keys(rule).filter(key => {
                return ![
                    "resource",
                    "rules",
                    "use",
                ].includes(key);
            });
            for (const key of keys) {
                result.push({
                    type: key,
                    value: rule[key]
                });
            }
            if(rule.use){
                rule.use.forEach(use => {
                    result.push({
                        type: 'use',
                        value: use,
                    })
                })
            } 
        })
        return result
    }

};
