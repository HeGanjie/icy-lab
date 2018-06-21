import _ from 'lodash'

let simpleMathOps = ["+", "-", "*", "/"]
let funcOps = ["pow"]

export function toJS(ast) {
  if (!_.isObject(ast)) {
    return ast
  }
  let {op, left, right} = ast
  if (_.includes(simpleMathOps, op)) {
    return `${toJS(left)} ${op} ${toJS(right)}`
  }
  // calling
  if (_.includes(funcOps, op)) {
    return right ? `${op}(${toJS(left)}, ${toJS(right)})` : `${op}(${toJS(left)})`
  }
  throw new Error(`Unknown op: ${op}`)
}
