const RuleSet = require('../lib/RuleSet');

describe('数据查询基础服务', () => {

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

  it('接收业务对象(简单对象、层级关系对象、带分类列表对象、复合对象)事件生成数据对象，可以查询数据', async () => {
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
        ["Action", "a", "a.name === 'validating'"],
        ["Table", "t"]
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
