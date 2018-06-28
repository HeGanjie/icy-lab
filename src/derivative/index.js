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

export function partialDerivativeLambda(ast, varName) {
  // console.log("ast: ", JSON.stringify(ast, null, 2))
  let res = derivativeAST(ast, varName)
  // console.log("before simplify: ", JSON.stringify(res, null, 2))

  return mostSimplify(res)
}

export default function derivativeLambda(namelessFun) {
  let {varNames, placeholders, ast} = parser.parse(namelessFun.toString())

  let varNameDFunDict = _.zipObject(varNames, varNames.map(varName => {
    let fnBodyAst = partialDerivativeLambda(ast, varName)
    // back to js lambda
    return _.isEmpty(placeholders)
      ? `({${varNames.join(', ')}}) => ${toJS(fnBodyAst)}`
      : `({${varNames.join(', ')}}, {${placeholders.join(', ')}}) => ${toJS(fnBodyAst)}`
  }))

  console.log(varNameDFunDict)

  // {W: ({W, b}, {xxx}) => ..., b: ({W, b}, {xxx}) => ...}
  return _.mapValues(varNameDFunDict, v => eval(v))
}
