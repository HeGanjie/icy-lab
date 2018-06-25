import _ from 'lodash'

const {abs} = Math

export function genSets(dataArr, weights) {
  let weightSum = _.sum(weights)
  let sDataArr = _.shuffle(dataArr)
  function recurPartition(shuffledData, weights) {
    let [headWeight, ...rest] = weights
    if (_.isEmpty(rest)) {
      return [shuffledData]
    } else {
      let toTakeCount = Math.round(headWeight / weightSum * dataArr.length)
      return [
        _.take(shuffledData, toTakeCount),
        ...recurPartition(_.drop(shuffledData, toTakeCount), rest)
      ]
    }
  }

  return recurPartition(sDataArr, weights)
}

export function getPredictCost(chargePredict, sess, X, Y) {
  let predictCost = 0
  for (let i = 0; i < X.length; i++) {
    predictCost += abs(sess.run(chargePredict, X[i]) - Y[i])
  }
  return predictCost / X.length
}

