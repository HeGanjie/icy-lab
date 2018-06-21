import _ from 'lodash'
import {toJS} from "./to-js"

function calc(ast) {
  return eval(toJS(ast))
}

function isCalcable(ast) {
  return isFinite(ast)
    || (_.isObject(ast) && (ast.op === 'neg' || ast.op === 'inv') && isFinite(ast.left))
}

// simplify 1 layer
// a - b => a + -b, a * b => a * 1/b
export default function simplify(ast) {
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
  // bracket last: (a + 5) + b => b + (a + 5);
  if (op === '+') {
    if (left === 0) {
      return simplify(right)
    }
    if (right === 0) {
      return simplify(left)
    }
    if (_.isObject(right) && right.op === '*' && (!_.isObject(left) || left.op === '+')) {
      return {op: '+', left: simplify(right), right: simplify(left)}
    }
    // mul more: 2 × x + x => 3 * x
    if (_.isEqual(left, right)) {
      return { op: "*", left: 2, right }
    }
    if (_.isObject(left) && left.op === '*') {
      if (_.isEqual(left.right, right)) {
        return {op: '*', left: {op: '+', left: left.left, right: 1}, right}
      }
    }
  }
  // multiplying, const first: (x * 5) * x => 5 * (x * x), x * (5 * x) => 5 * (x * x)
  // bracket last: (x * x) * x => x * (x * x)
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
    if (_.isObject(right) && right.op === '+') {
      return {
        op: '+',
        left: {op, left, right: right.left},
        right: {op, left, right: right.right}
      }
    }

    if (_.isObject(left) && left.op === '*') {
      // same last
      if (_.isEqual(left.right, right)) {
        let toMul = simplify(right)
        return {op, left: simplify(left.left), right: {op, left: toMul, right: toMul}}
      }
    }
    if (_.isObject(right) && right.op === '*') {
      // same last
      if (_.isEqual(left, right.right) && !_.isEqual(left, right.left)) {
        let toMul = simplify(left)
        return {op, left: simplify(right.left), right: {op, left: toMul, right: toMul}}
      }
    }
    if (_.isEqual(left, right)) {
      return {
        op: "pow",
        left: simplify(left),
        right: 2
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

