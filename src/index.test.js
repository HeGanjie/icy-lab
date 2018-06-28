import _ from 'lodash'
import {genSession, minimize} from "./index"
import fs from 'fs'
import {csvParse} from 'd3-dsv'
import math from 'mathjs'
import {genSets, getPredictCost, normalizeData} from "./util"

const {zeros, multiply, divide, matrix, mean, std, dotMultiply, log, pow, add, subtract, exp} = math

const insuranceData = csvParse(fs.readFileSync('./dataset/MedicalCostPersonalDatasets/insurance.csv', 'utf-8'))
// age,sex,bmi,children,smoker,region,charges
// 19,female,27.9,0,yes,southwest,16884.924
// 18,male,33.77,1,no,southeast,1725.5523

test.skip('min x for (x - 5)^2 is 5', () => {
  let sess = genSession()
  let fn = ({x}) => pow(x - 5, 2)
  let train = minimize(fn, 0.01)
  for (let i = 0; i < 500; i++) {
    sess.run(train)
  }

  expect(_.round(sess.run('x'), 3)).toBe(5);
});

test.skip('stochastic linear regression', () => {
  // use age and bmi to predict medical cost

  let chargesPredict = ({w0, w1, b}, {age, bmi}) => w0 * age + w1 * bmi + b
  let costFn = ({w0, w1, b}, {age, bmi, charges}) => pow(w0 * age + w1 * bmi + b - charges, 2) / 2

  let sess = genSession({w0: 0, w1: 0, b: 0})
  let train = minimize(costFn, 0.03)

  let [trainingSet, testSet] = genSets(insuranceData, [9, 1])

  let costBeforeTrain = getPredictCost(chargesPredict, sess, testSet, testSet.map(d => d.charges))
  console.log(`cost before train: `, costBeforeTrain)

  for (let epoch = 0; epoch < 1; epoch++) {
    for (let i = 0; i < trainingSet.length; i++) {
      let feed = trainingSet[i]
      sess.run(train, feed)
    }
  }

  let costAfterTrain = getPredictCost(chargesPredict, sess, testSet, testSet.map(d => d.charges))
  console.log(`cost after train: `, costAfterTrain)
  expect(costAfterTrain < costBeforeTrain).toBe(true);
})


test('mini-batch binary classification', () => {
  // predict some one is smoker
  let {normalizedDataArr, recoverFn} = normalizeData(insuranceData)

  // input layer: 6, hidden layer: 0, output layer: 1
  // X: 6*m, W: 1*6, b: 1*1, Y: 1*m
  // (1, 6) * (6, m) => 1 * m
  // g: sigmoid(W*X+b)
  // J(W) = -1/m * (Y .* log(g(...)) + (1 - Y) .* log(1 - g(...)))
  let sigmoid = z => divide(1, add(1, exp(subtract(0, z))))
  let predict = ({W, b}, {X}) => sigmoid(add(multiply(W, X), b))
  let costFn = ({W, b}, {X, Y, m}) => -(dotMultiply(Y, log(predict({W, b}, {X}))) + dotMultiply(subtract(1, Y), log(subtract(1, predict({W, b}, {X}))))) / m

  let sess = genSession({W: zeros(1, 6), b: 0})
  let train = minimize({costFn, predict, sigmoid}, 0.01)

  let [trainingSet, testSet] = genSets(normalizedDataArr, [9, 1])

  let costBeforeTrain = getPredictCost(predict, sess, testSet, testSet.map(d => d.smoker))
  console.log(`cost before train: `, costBeforeTrain)

  for (let epoch = 0; epoch < 1; epoch++) {
    for (let i = 0; i < trainingSet.length; i++) {
      let feed = trainingSet[i]
      sess.run(train, feed)
    }
  }

  let costAfterTrain = getPredictCost(predict, sess, testSet, testSet.map(d => d.smoker))
  console.log(`cost after train: `, costAfterTrain)
  expect(costAfterTrain < costBeforeTrain).toBe(true);
})
