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
                return !['test'].includes(key)
            }).forEach(key => {
                newRule[key] = rule[key]
            })
            return newRule;
        })
    }

};
