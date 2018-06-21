# Icy-lab

Building my own "tensorflow", work in progress.

>[What I can't create, I don't understand.](https://github.com/danistefanovic/build-your-own-x)

### How to play
1. clone the project
2. `npm i`
3. edit `src/index.js` if you want
4. `node index.js`

### Demo
```js
// code from src/index.js
const {pow} = Math
let sess = genSession()
console.log('x init: ', sess.run('x'))

let fn = x => pow(x - 5, 2)
let train = minimize(fn, 0.01)
let feed = {pow}
for (let i = 0; i <= 1000; i++) {
  sess.run(train, feed)
}
console.log(`min x for ${fn + ''} is:`, sess.run('x'))
```

run result:
```
x init:  0
minimize fn:  x => pow(x - 5, 2)
min x for x => pow(x - 5, 2) is: 4.999999991753459
```

### License
MIT
