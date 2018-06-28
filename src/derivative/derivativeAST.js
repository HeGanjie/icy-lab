import _ from 'lodash'
import {add, divide, exp, subtract} from "mathjs"

export default function derivativeAST(ast, varName, parsedDependencies = {}) {
  if (varName === undefined) {
    throw new Error('varName not pass')
  }
  // TODO neg, inv, dotMultiply, log, wrap, subtract
  if (isFinite(ast)) { // const' => 0
    return 0
  }
  if (ast === varName) { // x' => 1
    return 1
  }
  if (!_.isObject(ast) && /^[a-zA-Z_]\w*$/.test(varName)) { // y' => 0
    return 0
  }
  let {op, left, right} = ast
  if (op === "+" || op === "-") { // (x + 2)' => 1
    return {
      op,
      left: derivativeAST(left, varName, parsedDependencies),
      right: derivativeAST(right, varName, parsedDependencies)
    }
  }
  if (op === "*") { // (2*x)' => 2
    return {
      op: "+",
      left: { op: "*", left: derivativeAST(left, varName, parsedDependencies), right },
      right: { op: "*", left, right: derivativeAST(right, varName, parsedDependencies) }
    }
  }
  if (op === '/') {
    return {
      op,
      left: {
        op: '-',
        left: { op: '*', left: derivativeAST(left, varName, parsedDependencies), right },
        right: { op: '*', left, right: derivativeAST(right, varName, parsedDependencies) }
      },
      right: { op: 'pow', left: right, right: 2 }
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
      right: derivativeAST(left, varName, parsedDependencies)
    }
  }
  // let chargesPredict = ({w0, w1, b}, {age, bmi}) => w0 * age + w1 * bmi + b
  // let costFn = ({w0, w1, b}, {age, bmi, charges}) => pow(chargesPredict({w0, w1, b}, {age, bmi}) - charges, 2) / 2
  // d(costFn)/d(w0) => d(costFn)/d(chargesPredict) * d(chargesPredict)/d(w0)

  // let sigmoid = z => divide(1, add(1, exp(subtract(0, z))))
  // let active = X => sigmoid(W * X + b)

  // let z = W * X + b
  // d(active)/dX => d(sigmoid(z))/d(z) * d(z)/d(X)
  if (op in parsedDependencies) {
    let {varNames: fnVarNames, varName: fnVarName, ast: fnAst} = parsedDependencies[op]
    if (fnVarName) {
      return {
        op: 'dotMultiply',
        left: derivativeAST(fnAst, fnVarName, parsedDependencies),
        right: derivativeAST(left, varName, parsedDependencies)
      }
    } else {
      // wrap and destructuring same varName, always using first arguments
      if (left.op !== 'wrap') {
        throw new Error(`${JSON.stringify(left)} can not destructuring to {${fnVarNames.join()}}`)
      }
      return derivativeAST(fnAst, varName, parsedDependencies)
    }
  }
  throw new Error(`Unimplemented: ${JSON.stringify(ast)}`)
}
