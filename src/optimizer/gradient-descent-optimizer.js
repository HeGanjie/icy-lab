import derivativeLambda from "../derivative"

export function minimize(fn, learningRate = 0.1) {
  console.log('minimize fn: ', fn.toString())
  let envToDx = derivativeLambda(fn)
  return (x, feed) => {
    let dx = envToDx(feed)
    // x = x - a * dx
    return x - learningRate * dx(x)
  }
}
