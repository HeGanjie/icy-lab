import _ from 'lodash'
import {toJS} from "./to-js"

// calc js will use this
const {pow} = Math

function calc(ast) {
  return eval(toJS(ast))
}

function isCalcable(ast) {
  return isFinite(ast)
    || (_.isObject(ast) && (ast.op === 'neg' || ast.op === 'inv') && isFinite(ast.left))
}

function isMul(ast) {
  return _.isObject(ast) && ast.op === '*'
}

function isAdd(ast) {
  return _.isObject(ast) && ast.op === '+'
}

// a - b => a + -b, a * b => a * 1/b
function simplify(ast) {
  if (typeof ast !== 'object') {
    return ast
  }
  let {op, left, right} = ast

  if (op === '-') {
    if (left === 0) {
      return { op: 'neg', left: simplify(right) }
    }
    // a - b => a + -b
    return { op: '+', left: simplify(left), right: { op: 'neg', left: simplify(right) } }
  }
  if (op === '/') {
    if (left === 0) {
      return 0
    }
    // a / b => a * 1/b
    return { op: '*', left: simplify(left), right: {op: 'inv', left: simplify(right)} }
  }

  // no more - and /, only + * neg inv
  if (op === 'neg') {
    if (left === 0) {
      return 0
    }
    if (_.isObject(left) && left.op === 'neg') {
      return left.left
    }
  }
  if (op === 'inv') {
    if (left === 0) {
      return 0
    }
    if (_.isObject(left) && left.op === 'inv') {
      return left.left
    }
  }
  if (isCalcable(left) && isCalcable(right)) {
    return calc(ast)
  }

  // TODO x + -x, x * 1/x, 2 * x + x, 2 * x * 1/x

  // sort:
  // adding, mul first: a + bx => bx + a;
  // bracket first: a + (5 + b) => (a + 5) + b
  if (op === '+') {
    if (left === 0) {
      return simplify(right)
    }
    if (right === 0) {
      return simplify(left)
    }
    // mul first: a + bx => bx + a
    if (isMul(right) && (!_.isObject(left) || left.op === '+')) {
      return {op: '+', left: simplify(right), right: simplify(left)}
    }
    // mul more: 2 × x + x => 3 * x
    if (_.isEqual(left, right)) {
      return { op: "*", left: 2, right }
    }
    if (isMul(left)) {
      if (_.isEqual(left.right, right)) {
        return {
          op: '*',
          left: {op: '+', left: left.left, right: 1},
          right
        }
      }
    }
    // bracket first
    if (isAdd(right)) {
      return {
        op,
        left: { op, left, right: right.left },
        right: right.right
      }
    }
  }
  // multiplying, const first: (x * 5) * x => 5 * (x * x), x * (5 * x) => 5 * (x * x)
  // merge to pow: (a * x) * x => a * pow(x, 2)
  // bracket first: a * (x * y) => (a * x) * y
  if (op === '*') {
    // const first
    if (!isCalcable(left) && isCalcable(right)) {
      return {op, left: simplify(right), right: simplify(left)}
    }

    // less layer
    if (left === 0) {
      return 0
    }
    if (left === 1) {
      return simplify(right)
    }
    // 2 * (x + 1) => 2*x + 2
    if (isAdd(right)) {
      return {
        op: '+',
        left: {op, left, right: right.left},
        right: {op, left, right: right.right}
      }
    }

    // merge to pow
    if (isMul(left) && _.isEqual(left.right, right)) {
      return {
        op,
        left: simplify(left.left),
        right: {op: "pow", left: simplify(right), right: 2}
      }
    }
    if (_.isEqual(left, right)) {
      return { op: "pow", left: simplify(left), right: 2 }
    }

    // bracket first
    if (isMul(right)) {
      return {
        op,
        left: { op, left, right: right.left },
        right: right.right
      }
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

export default function mostSimplify(ast) {
  let s1 = simplify(ast)
  while (!_.isEqual(s1, ast)) {
    ast = s1
    s1 = simplify(s1)
  }
  return s1
}
