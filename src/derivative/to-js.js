import _ from 'lodash'

let funcOps = ["pow"]

function isAdd(ast) {
  return _.isObject(ast) && ast.op === '+'
}

export function toJS(ast) {
  if (!_.isObject(ast)) {
    return ast
  }
  let {op, left, right} = ast
  if (op === '+') {
    return `${toJS(left)} ${op} ${toJS(right)}`
  }
  if (op === '*') {
    let leftSide = isAdd(left) ? `(${toJS(left)})` : toJS(left)
    let rightSide = isAdd(right) ? `(${toJS(right)})` : toJS(right)
    return `${leftSide} ${op} ${rightSide}`
  }
  if (op === 'neg') {
    return _.isObject(left) ? `-(${toJS(left)})` : `-${toJS(left)}`
  }
  if (op === 'inv') {
    return _.isObject(left) ? `1/(${toJS(left)})` : `1/${toJS(left)}`
  }
  // calling
  if (_.includes(funcOps, op)) {
    return right ? `${op}(${toJS(left)}, ${toJS(right)})` : `${op}(${toJS(left)})`
  }
  throw new Error(`Unknown op: ${op}`)
}
