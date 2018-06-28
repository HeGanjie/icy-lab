import {parser, partialDerivativeLambda} from './index'

function derivative(fn) {
  let {varNames, varName, ast} = parser.parse(fn.toString())
  return partialDerivativeLambda(ast, varName || varNames[0])
}

test('dx: x^2', () => {
  let costFn = ({x}) => pow(x, 2)
  expect(derivative(costFn)).toBe('2 * x');
})

test('dx: x * 2 * y', () => {
  let costFn = (x) => x * 2 * y
  expect(derivative(costFn)).toBe('2 * y');
})

test('dx: (x - 1)^2', () => {
  let costFn = ({x}) => pow(x - 1, 2)
  expect(derivative(costFn)).toBe('2 * x + -2');
})

test('dx: x^2 / 2y', () => {
  let costFn = x => pow(x, 2) / (2 * y)
  expect(derivative(costFn)).toBe('x * 1/y');
})

// http://www.gatsby.ucl.ac.uk/teaching/courses/sntn/sntn-2017/resources/Matrix_derivatives_cribsheet.pdf

test.only('dX: X + 1', () => {
  let fn = X => add(X, 1)
  expect(derivative(fn)).toBe('X');
})

test('dX: X + A', () => {
  let fn = X => add(X, 1)
  expect(derivative(fn)).toBe('');
})

test('dX: X * A', () => {
  let fn = X => add(X, 1)
  expect(derivative(fn)).toBe(''); // eye .* A'
})

test('dX: A * X', () => {
  let fn = X => add(X, 1)
  expect(derivative(fn)).toBe(''); // A' .* eye
})

test('dX: X .* A', () => {
  let fn = X => add(X, 1)
  expect(derivative(fn)).toBe('');
})

test(`dX: X' * A`, () => {
  let fn = X => add(X, 1)
  expect(derivative(fn)).toBe('');
})

test(`dX: A * X'`, () => {
  let fn = X => add(X, 1)
  expect(derivative(fn)).toBe('');
})

test(`dX: X' .* A`, () => {
  let fn = X => add(X, 1)
  expect(derivative(fn)).toBe('');
})

test(`dX: X' * X`, () => {
  let fn = X => add(X, 1)
  expect(derivative(fn)).toBe('2 * X');
})

test(`dX: X' * A * X`, () => {
  let fn = X => add(X, 1)
  expect(derivative(fn)).toBe('2 * A * X');
})
