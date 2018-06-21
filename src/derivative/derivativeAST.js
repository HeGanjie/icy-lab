import _ from 'lodash'

export default function derivativeAST(ast, varName) {
  if (varName === undefined) {
    throw new Error('varName not pass')
  }
  if (isFinite(ast)) { // const' => 0
    return 0
  }
  if (ast === varName) { // x' => 1
    return 1
  }
  if (!_.isObject(ast) && /^\w+$/.test(varName)) { // y' => 0
    return 0
  }
  let {op, left, right} = ast
  if (op === "+" || op === "-") { // (x + 2)' => 1
    return {op, left: derivativeAST(left, varName), right: derivativeAST(right, varName) }
  }
  if (op === "*") { // (2*x)' => 2
    return {
      op: "+",
      left: { op: "*", left: derivativeAST(left, varName), right },
      right: { op: "*", left, right: derivativeAST(right, varName) }
    }
  }
  if (op === 'pow') { // pow(x - 5, 2)' => 2 * (x - 5)
    return {
      op: "*",
      left: {
        op: "*",
        left: right,
        right: {
          op: "pow",
          left,
          right: {op: "-", left: right, right: 1}
        }
      },
      right: derivativeAST(left, varName)
    }
  }
  throw new Error("unimplement: ", ast)
}
