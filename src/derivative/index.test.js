import {parser, partialDerivativeLambda} from './index'
import {toJS} from "./to-js"

test('dx: x^2', () => {
  let costFn = x => pow(x, 2)
  let {varNames, ast} = parser.parse(costFn.toString())
  let resAst = partialDerivativeLambda(ast, varNames[0])
  let jsBody = toJS(resAst)

  expect(jsBody).toBe('2 * x');
})

test('dx: (x + 1)^2', () => {
  let costFn = x => pow(x + 1, 2)
  let {varNames, ast} = parser.parse(costFn.toString())
  let resAst = partialDerivativeLambda(ast, varNames[0])
  let jsBody = toJS(resAst)

  expect(jsBody).toBe('2 * x + 2');
})

test('dx: x^2 + 2x', () => {
  let costFn = x => pow(x, 2) + 2 * x
  let {varNames, ast} = parser.parse(costFn.toString())
  let resAst = partialDerivativeLambda(ast, varNames[0])
  let jsBody = toJS(resAst)

  expect(jsBody).toBe('2 * x + 2');
})
