var valueParser = require('postcss-value-parser');

const plugin = (options = {}) => {
    return {
      postcssPlugin: "postcss-media-parser",
  
      prepare(result) {
        const parsedAtRules = [];
        return {
          AtRule: {
            media(atRule) {
              const parsedAtRule = {
                atRule,
                params: atRule.params, // (max-width: 480px)
                width: valueParser(atRule.params).nodes.map(n => n.nodes)[0][2].value.replace('px', ''), // 480px
                ruleStr: atRule.nodes.map(n => n.toString()).join('')
              };
              parsedAtRules.push(parsedAtRule);
            }
          },
  
          async OnceExit() {
            if (parsedAtRules.length === 0) {
              return;
            }
            const {mediaRules} = options;
            const widthMap = new Map();

            for(let index = 0; index < parsedAtRules.length; index ++){
              const { atRule, params, width, ruleStr } = parsedAtRules[index]
              atRule.remove();
              let obj = widthMap.get(width);
              if(!obj){
                obj = {
                  params: params,
                  width: width,
                  ruleStr: ruleStr
                }
              } else {
                obj.ruleStr = obj.ruleStr + ruleStr
              }
              widthMap.set(width, obj);
            }

            [...widthMap].forEach(item => {
              mediaRules.push(item[1])
            })
          }

        };
      }
  
    };
  };
  plugin.postcss = true
  
  module.exports = plugin;
  