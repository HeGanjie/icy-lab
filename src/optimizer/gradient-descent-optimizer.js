import derivativeLambda from "../derivative"
import _ from 'lodash'

export function minimize(costFn, learningRate = 0.1) {
  let varNameDxDict
  if (_.isFunction(costFn)) {
    varNameDxDict = derivativeLambda(costFn)
  } else {
    let costFnKey = _.findKey(costFn, (v, k) => _.includes(k, 'lost') || _.includes(k, 'cost'))
    varNameDxDict = derivativeLambda(costFn[costFnKey], _.omit(costFn, costFnKey))
  }

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
