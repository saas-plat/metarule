const RuleSet = require('../lib/RuleSet');
require('i18next').init();

describe('规则引擎', () => {

  class Table {
    constructor(Name) {
      this.Name = Name;
    }
  }

  class Action {
    constructor(name) {
      this.name = name;
    }
  }

  it('定义一个规则', async () => {
    const ruleset = new RuleSet('ruleset1', [{
      "name": "xxxx",
      "when": [
        ["Action", "a", "a.name === 'saving'"],
        ["Table", "t"]
      ],
      "then": [
        `if (t.Name === 'cccc'){
          t.Name = 'bbbb'
        }`
      ]
    }, {
      "name": "validating",
      "when": [
        ["Action", "a", facts => facts.a.name === 'validating'],   // 支持直接js定义
        [Table, "t"]
      ],
      "then": [
        `console.log(facts)`,
        `if (!t.Name){
            throw new Error('!Name', t.Name)
          }else{
            console.log('validating',t.Name,'=>OK')
          }`
      ]
    }], {
      Table,
      Action
    });

    await ruleset.execute([new Table('bbbb'), new Action('validating')])
  })
})
