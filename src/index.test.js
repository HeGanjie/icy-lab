import _ from 'lodash'
import {genSession, minimize} from "./index"

const {pow} = Math


test('min x for (x - 5)^2 is 5', () => {
  let sess = genSession()
  let fn = x => pow(x - 5, 2)
  let train = minimize(fn, 0.01)
  let feed = {pow}
  for (let i = 0; i < 500; i++) {
    sess.run(train, feed)
  }

  expect(_.round(sess.run('x'), 3)).toBe(5);
});
