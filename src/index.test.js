import _ from 'lodash'
import {genSession, minimize} from "./index"
import fs from 'fs'
import {csvParse} from 'd3-dsv'
import {zeros, multiply, matrix} from 'mathjs'
import {genSets, getPredictCost} from "./util"

const {pow} = Math

test('min x for (x - 5)^2 is 5', () => {
  let sess = genSession()
  let fn = ({x}) => pow(x - 5, 2)
  let train = minimize(fn, 0.01)
  for (let i = 0; i < 500; i++) {
    sess.run(train)
  }

  expect(_.round(sess.run('x'), 3)).toBe(5);
});

test('stochastic linear regression', () => {
  let text = fs.readFileSync('./dataset/MedicalCostPersonalDatasets/insurance.csv', 'utf-8')
  let data = csvParse(text)
  // age,sex,bmi,children,smoker,region,charges
  // 19,female,27.9,0,yes,southwest,16884.924
  // 18,male,33.77,1,no,southeast,1725.5523

  // use age and bmi to predict medical cost

  // let age = 0, bmi = 0, charge = 0
  // matMul: (1, 2) * (2, m) => 1 * m
  // charge: 1 * m
  let chargesPredict = ({w0, w1, b}, {age, bmi}) => w0 * age + w1 * bmi + b

  let costFn = ({w0, w1, b}, {age, bmi, charges}) => pow(w0 * age + w1 * bmi + b - charges, 2) / 2

  let sess = genSession({w0: 0, w1: 0, b: 0})
  let train = minimize(costFn, 0.03)

  let [trainingSet, testSet] = genSets(data, [9, 1])

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
