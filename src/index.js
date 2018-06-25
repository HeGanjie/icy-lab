import {minimize} from "./optimizer/gradient-descent-optimizer"
import {genSession} from "./session"

const {pow} = Math


let sess = genSession()
console.log('x init: ', sess.run('x'))

let fn = x => pow(x - 5, 2)
let train = minimize(fn, 0.01)
let feed = {pow}
for (let i = 0; i < 500; i++) {
  sess.run(train, feed)
}

console.log(`min x for ${fn + ''} is:`, sess.run('x'))
