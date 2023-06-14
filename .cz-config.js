'use strict';

module.exports = {

  types: [{
    value: 'feat',
    name: 'feat: 增加完整的新特性'
  }, {
    value: 'wip',
    name: 'wip: 较大特性开发的阶段性提交'
  }, {
    value: 'fix',
    name: 'fix: 修复 bug'
  }, {
    value: 'perf',
    name: 'perf: 提高性能的代码优化'
  }, {
    value: 'refactor',
    name: 'refactor: 既不修复 bug 也不添加新特性的代码重构'
  }, {
    value: 'style',
    name: 'style: 不影响代码含义的风格改动，如空格缩进、分号等'
  }, {
    value: 'docs',
    name: 'docs: 修改文档相关的文件'
  }, {
    value: 'test',
    name: 'test: 添加或修正已存在的测试用例'
  }, {
    value: 'merge',
    name: 'merge: 合并分支包括解决冲突的提交'
  }, {
    value: 'build',
    name: 'build: 打包的提交，或对构建配置、依赖项等的修改'
  }, {
    value: 'ci',
    name: 'ci: 对 CI/CD 配置文件或脚本的更改'
  }],

  scopes: [],
  allowCustomScopes: true,
  allowBreakingChanges: ["Feat", "Fix"]
};
