# metarule

规则引擎，提供业务逻辑的定义和解析执行

# 配置
需要由调用方初始化i18next

# 规则语法
由一组条件和行为组成
```js
{
  "name": "validating",
  "when": [
    ["Action", "a", facts => facts.a.name === 'validating'],   
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
}
```
