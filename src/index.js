import derivativeLambda from "./derivative"
const {pow} = Math

let y = 1

// let fn = x => pow(x, 2) + y
let fn = x => pow(x - 5, 2)

console.log('fn: ', fn.toString())

let dx = derivativeLambda(fn, {pow, y})

console.log('d(fn): ', dx.toString())
console.log('dx at 3 is', dx(3))
