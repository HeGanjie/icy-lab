import derivativeLambda from "../derivative"
import _ from 'lodash'

export function minimize(fn, learningRate = 0.1) {
  // console.log('minimize fn: ', fn.toString())
  let envToDxDict = derivativeLambda(fn)

  // return delta dict
  return (varValDict, feed) => {
    let dxDict = envToDxDict(feed)
    let deltaDict = _.mapValues(dxDict, (fn) => {
      // x = x - a * dx
      return - learningRate * _.clamp(fn(varValDict), -10, 10)
    })

    for (let varName in deltaDict) {
      varValDict[varName] += deltaDict[varName]
/*    if (!isFinite(varValDict[varName])) {
        throw new Error(`NaN result when training: ${JSON.stringify(deltaDict)}`)
      }*/
    }
  }
}
