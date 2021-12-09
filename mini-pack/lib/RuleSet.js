module.exports = class RuleSet {
	constructor(rules) {
		this.references = Object.create(null);
        const ident = "ref-"
        this.rules = rules.map((rule, idx) => {
            const id = `${ident}-${idx}`
            const newRule = {...rule};
            if(rule.test){
                newRule.resource = {}
            }
            return newRule;
        })
    }

};
