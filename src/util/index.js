import _ from 'lodash'
import {zeros, multiply, matrix, mean, std} from 'mathjs'

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

export function normalizeData(data) {
  // {numCol: {u, sd}, strCol: {a: 0, b: 1, c: 2, ...}}
  let colNames = _.keys(data[0])
  let translateDict = _.zipObject(colNames, colNames.map(colName => {
    let isNumCol = isFinite(data[0][colName])
    let allVals = data.map(d => d[colName])
    if (isNumCol) {
      return {u: mean(allVals), sd: std(allVals)}
    } else {
      let uniqVals = _.uniq(allVals)
      return _.zipObject(uniqVals, _.range(uniqVals.length))
    }
  }))

  console.log(translateDict)
  let normalizedDataArr = data.map(d => {
    let nextD = {}
    for (let k in d) {
      let translateInfo = translateDict[k]
      let v = d[k]
      nextD[k] = 'u' in translateInfo ? (v - translateInfo.u) / translateInfo.sd : translateInfo[v]
    }
    return nextD
  })

  function recoverFn(normalizedDataArr) {
    let reverseTranslateFnDict = _.mapValues(translateDict, (info, k) => {
      if ('u' in info) {
        return nv => nv * info.sd + info.u
      } else {
        let reverseInfo = _.zipObject(_.values(info), _.keys(info))
        return nv => reverseInfo[nv]
      }
    })
    return normalizedDataArr.map(nd => {
      let d = {}
      for (let k in nd) {
        d[k] = reverseTranslateFnDict[k](nd[k])
      }
      return d
    })
  }
  return {normalizedDataArr, recoverFn}
}
