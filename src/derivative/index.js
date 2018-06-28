import _ from "lodash"
import peg from "pegjs";
import fs from 'fs'
import mostSimplify from "./simplify"
import derivativeAST from "./derivativeAST"
import {toJS} from "./to-js"

// backprop will need this
const {pow} = Math

const grammar = fs.readFileSync('./src/derivative/lambda-parser.grammar').toString('utf8')

export const parser = peg.generate(grammar)

export function partialDerivativeLambda(ast, varName, parsedDependencies = {}) {
  // console.log("ast: ", JSON.stringify(ast, null, 2))
  let res = derivativeAST(ast, varName, parsedDependencies)
  // console.log("before simplify: ", JSON.stringify(res, null, 2))

  let fnBodyAst = mostSimplify(res)
  return toJS(fnBodyAst)
}

export default function derivativeLambda(namelessFun, dependencies = {}) {
  console.log('parsing: ', namelessFun + '')
  let {varNames, varName, placeholders, ast} = parser.parse(namelessFun.toString())
  let parsedDependencies = _.mapValues(dependencies, v => parser.parse(v + ''))

  let partial = varName0 => {
    let fnBody = partialDerivativeLambda(ast, varName0, parsedDependencies)
    // back to js lambda
    if (varNames) {
      return _.isEmpty(placeholders)
        ? `({${varNames.join(', ')}}) => ${fnBody}`
        : `({${varNames.join(', ')}}, {${placeholders.join(', ')}}) => ${fnBody}`
    } else {
      return `${varName0} => ${fnBody}`
    }
  }
  let varNameDFunDict = varName
    ? {[varName]: partial(varName)}
    : _.zipObject(varNames, varNames.map(partial))

  console.log(varNameDFunDict)

  // {W: ({W, b}, {xxx}) => ..., b: ({W, b}, {xxx}) => ...}
  return _.mapValues(varNameDFunDict, v => eval(v))
}
