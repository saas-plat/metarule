const {
  RuleSet
} = require('../lib');
require('i18next').init();

describe('规则引擎', () => {

  class Table {
    constructor(Name) {
      this.Name = Name;
    }
  }

  class Action {
    constructor(name, other = {}) {
      this.name = name;
      Object.keys(other).forEach(key => {
        this[key] = other[key]
      })
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
        ["Action", "a", facts => facts.a.name === 'validating'], // 支持直接js定义
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

  it('升级条件函数versionAt和seriesIn', async () => {
    const ruleset = new RuleSet('ruleset1', [{
      name: 'update_sciprt3',
      when: [
        [
         'Action',  'e',
          `  e.name == 'Department.migrate' && e.event == 'saved' &&
          versionAt(e, '3.0.0') && seriesIn(e, 'industry2')`
        ]
      ],
      then: [
        `e.data.Name2 = e.data.Name + 'xxxxx'`,
        `console.log('e.data.Name2 =', e.data.Name2) `
      ]
    }], { 
      Action
    })

    await ruleset.execute([
      new Action('Department.migrate', {
        event: 'saved',
        from: '1.0.0',
        to: '2.0.0',
        series: 'industry2',
        data: {
          Name: 'aaa'
        }
      })
    ])

  })

})
