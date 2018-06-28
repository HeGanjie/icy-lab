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

function is(ast, op) {
  return _.isObject(ast) && ast.op === op
}

function isInv(ast) {
  return _.isObject(ast) && ast.op === 'inv'
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
    // 1 / (4 * y) => 1/4 * 1/y
    if (isMul(left) && isCalcable(left.left)) {
      return {
        op: '*',
        left: {op, left: left.left},
        right: {op, left: left.right}
      }
    }
    // 1/pow(y, n) => pow(y, -1 * n)
    if (is(left, 'pow')) {
      let powExp = left
      return { ...powExp, right: {op: '*', left: {op: 'neg', left: 1}, right: powExp.right} }
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
    // (a * x) * x => a * pow(x, 2)
    if (isMul(left) && _.isEqual(left.right, right)) {
      return {
        op,
        left: simplify(left.left),
        right: {op: "pow", left: simplify(right), right: 2}
      }
    }
    // x * x => pow(x, 2)
    if (_.isEqual(left, right)) {
      return { op: "pow", left: simplify(left), right: 2 }
    }
    // y * pow(y, n) => pow(y, n + 1)
    if (is(right, 'pow') && _.isEqual(left, right.left)) {
      return {op: 'pow', left, right: {op: '+', left: 1, right: right.right}}
    }

    // bracket first
    if (isMul(right)) {
      return {
        op,
        left: { op, left, right: right.left },
        right: right.right
      }
    }
    // (x * y) * pow(y, -2) => x * pow(y, -1)
    if (isMul(left)) {
      let assumeRight = {op, left: left.right, right}
      let trySimR = simplify(assumeRight)
      if (!_.isEqual(trySimR, assumeRight)) {
        return {op, left: left.left, right: trySimR}
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
    if (right === -1) {
      return {op: 'inv', left}
    }
    // pow(2 * x, 2) => 4 * pow(x, 2)
    if (isMul(left) && isCalcable(left.left) && isCalcable(right)) {
      return {
        op: '*',
        left: calc({op, left: left.left, right}),
        right: {op, left: left.right, right}
      }
    }
    // pow(1/y, a) => pow(y, -1 * a)
    if (isInv(left)) {
      return {op, left: left.left, right: {op: '*', left: {op: 'neg', left: 1}, right}}
    }
  }

  return {op, left: simplify(left), right: simplify(right)}
}

export default function mostSimplify(ast) {
  let s1 = simplify(ast)
  while (!_.isEqual(s1, ast)) {
    ast = s1
    s1 = simplify(s1)
    // console.log('sim res: ', toJS(ast))
  }
  return s1
}
