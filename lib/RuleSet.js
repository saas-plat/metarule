const nools = require('nools');
const {
  modifiers
} = require('nools/lib/compile/common');
const extd = require("nools/lib/extended"),
  forEach = extd.forEach;
const {
  Model
} = require('@saas-plat/metaschema');
const RuleError = require('./Error');
const {
  assignId
} = require('./util');
const {
  t
} = require('./i18n');
const innerScope = require('./scope');
const debug = require('debug')('saas-plat:RuleSet');

// 解析参见 node_modules/nools/lib/compile
const parseConstraint = (constraints, define, identifiers) => {
  if (!constraints) {
    return constraints;
  }
  constraints.forEach(constraint => {
    const r0 = constraint[0];
    if (r0 === 'not' || r0 === 'exists') {
      constraint[1] = constraint[1] instanceof Model ?
        define[constraint[1].name] :
        typeof constraint[1] === 'string' ?
        define[constraint[1]] :
        constraint[1];
      identifiers.push(constraint[2]);
    } else if (r0 === 'or') {
      parseConstraint(constraint.slice(1), define, identifiers);
    } else {
      constraint[0] = constraint[1] instanceof Model ?
        define[constraint[1].name] :
        typeof constraint[0] === 'string' ?
        define[constraint[0]] :
        constraint[0];
      identifiers.push(constraint[1]);
    }
  });
  return constraints;
}

const parseAction = (action, identifiers, defined, scope) => {
  if (typeof action === 'function') {
    return action;
  } else if (Array.isArray(action)) {
    action = action.join('\n');
  }
  var declares = [];
  forEach(identifiers, function (i) {
    if (action.indexOf(i) !== -1) {
      declares.push("var " + i + "= facts." + i + ";");
    }
  });
  extd(defined).keys().forEach(function (i) {
    if (action.indexOf(i) !== -1) {
      declares.push("var " + i + "= defined." + i + ";");
    }
  });

  extd(scope).keys().forEach(function (i) {
    if (action.indexOf(i) !== -1) {
      declares.push("var " + i + "= scope." + i + ";");
    }
  });
  extd(modifiers).forEach(function (i) {
    if (action.indexOf(i) !== -1) {
      declares.push("if(!" + i + "){ var " + i + "= flow." + i + ";}");
    }
  });
  var params = ["facts", 'flow'];
  if (/next\(.*\)/.test(action)) {
    params.push("next");
  }
  action = declares.join("") + action;
  try {
    return new Function("defined, scope",
      "return " + new Function(params.join(","), action).toString()
    )(defined, scope);
  } catch (e) {
    throw new Error("Invalid action : " + action + "\n" + e.message);
  }
};

module.exports = class RuleSet {

  constructor(name, noolsSource = [], define, scope = {}) {
    this.name = name || assignId('RuleSet');
    // 这里没找到问题根源，在单元测试反复执行时不触发规则
    if (process.env.NODE_ENV !== 'production') {
      nools.hasFlow(this.name) && nools.deleteFlow(this.name);
    }
    //  debug('%s ruleset...', name)
    if (!noolsSource) {
      noolsSource = [];
    }
    if (!Array.isArray(noolsSource)) {
      noolsSource = [noolsSource];
    }
    //debug(noolsSource.join('\n'))
    const isDsl = noolsSource.every(src => typeof src === 'string');
    try {
      scope = {
        ...innerScope,
        ...scope
      }
      this.flow = nools.getFlow(name) || isDsl ? nools.compile(noolsSource.join('\n'), {
        define,
        scope,
        name: this.name
      }) : nools.flow(name, (flow) => {
        for (let {
            name,
            when,
            then
          } of noolsSource) {
          if (!Array.isArray(when)) {
            when = [when];
          }
          // when转换类型定义成define中的类型
          const defines = {
            Array: Array,
            String: String,
            Number: Number,
            Boolean: Boolean,
            RegExp: RegExp,
            Date: Date,
            Object: Object,
            ...define
          }
          //  提取when中的别名
          const identifiers = [];
          const constraints = parseConstraint(when, defines, identifiers);
          // debug('when:%o', when);
          // debug('identifiers:%o', identifiers);
          // 解构别名的变量
          const action = parseAction(then, identifiers, defines, scope);
          debug(constraints, action)
          flow.rule(name, {
            scope
          }, constraints, action);
        }
      });
    } catch (err) {
      throw new RuleError(t('规则语法错误, {{message}}', {
        message: err.message
      }));
    }
    debug('%s load %s rules', this.name, noolsSource.length);
  }

  async execute(facts, filter) {
    debug('execute %s session...%o', this.name, facts.map(it => it.name || `#${it.constructor.name}#` || '#Object#'));
    const session = this.flow.getSession(...facts);
    let result;
    try {
      await session.match();
      if (filter) {
        result = session.getFacts(filter);
      } else {
        result = session.getFacts();
      }
      // } catch (err) {
      //   throw err;
    } finally {
      //debug('dispose %s session', this.name);
      session.dispose();
    }
    return result;
  }

  dispose() {
    debug('dispose %s flow', this.name);
    nools.deleteFlow(this.name);
    this.flow = null;
  }
}
