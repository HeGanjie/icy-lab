import _ from 'lodash'

export function genSession(x = 0) {
  return {
    run: function (toEval, feed) {
      if (_.isFunction(toEval)) {
        let nextx = toEval(x, feed)
        x = nextx
        return nextx
      }
      // for reading x ?
      if (_.isString(toEval)) {
        return eval(toEval)
      }
      throw new Error('Unimplement')
    }
  }
}
