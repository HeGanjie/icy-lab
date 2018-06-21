import _ from "lodash"
import peg from "pegjs";
import fs from 'fs'
import simplify from "./simplify"
import derivativeAST from "./derivativeAST"
import {toJS} from "./to-js"

let grammar = fs.readFileSync('./src/derivative/lambda-parser.grammar').toString('utf8')

let parser = peg.generate(grammar)

export default function derivativeLambda(namelessFun, env = {}) {
  let {varName, ast} = parser.parse(namelessFun.toString())
  // console.log("ast: ", JSON.stringify(ast, null, 2))
  let res = derivativeAST(ast, varName)
  // console.log("before simplify: ", JSON.stringify(res, null, 2))
  let s1 = simplify(res)
  // console.log("simplified: ", JSON.stringify(s1, null, 2))
  while (!_.isEqual(s1, res)) {
    res = s1
    s1 = simplify(s1)
    // console.log("simplified: ", JSON.stringify(s1, null, 2))
  }
  // console.log("after simplify: ", JSON.stringify(s1, null, 2))

  // back to js lambda
  let toEval = `let {${Object.keys(env).join(', ')}} = env; ${varName} => ${toJS(s1)}`
  return eval(toEval)
}
