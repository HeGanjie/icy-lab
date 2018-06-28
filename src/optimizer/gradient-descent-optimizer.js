import derivativeLambda from "../derivative"
import _ from 'lodash'

export function minimize(fn, learningRate = 0.1) {
  // console.log('minimize fn: ', fn.toString())
  let varNameDxDict = derivativeLambda(fn)

  // return delta dict
  return (varValDict, feed) => {
    let deltaDict = _.mapValues(varNameDxDict, (fn) => {
      // x = x - a * dx
      return - learningRate * _.clamp(fn(varValDict, feed), -10, 10)
    })

    for (let varName in deltaDict) {
      varValDict[varName] += deltaDict[varName]
/*    if (!isFinite(varValDict[varName])) {
        throw new Error(`NaN result when training: ${JSON.stringify(deltaDict)}`)
      }*/
    }
  }
}
