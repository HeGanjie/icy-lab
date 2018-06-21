import _ from 'lodash'
import {toJS} from "./to-js"

function calc(ast) {
  return eval(toJS(ast))
}

export default function simplify(ast) {
  if (typeof ast !== "object") {
    return ast
  }
  let {op, left, right} = ast

  if (isFinite(left) && isFinite(right)) {
    return calc(ast)
  }

  if (op === "*" || op === "/") {
    if (left === 1) {
      return simplify(right)
    } else if (right === 1) {
      return simplify(left)
    }
  }

  if (left === 0) {
    if (op === "+") {
      return simplify(right)
    }
    if (op === "*" || op === "/") {
      return 0
    }
  }

  if (right === 0) {
    if (op === "+" || op === "-") {
      return simplify(left)
    }
    if (op === "*") {
      return 0
    }
  }

  if (_.isEqual(left, right)) {
    if (op === "+") {
      return { op: "*", left: 2, right }
    }
    if (op === "-") {
      return 0
    }
    if (op === "/" && right !== 0) {
      return 1
    }
  }

  if (op === 'pow') {
    if (right === 0) {
      return 1
    }
    if (right === 1) {
      return simplify(left)
    }
  }
  return {op, left: simplify(left), right: simplify(right)}
}

