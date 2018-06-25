import _ from 'lodash'

export function genSession(variables = {x: 0}) {
  return {
    run: (toRun, feed) => {
      if (_.isFunction(toRun)) {
        // predict
        return toRun(variables, feed)
      }
      if (_.isString(toRun)) {
        // for reading var
        return variables[toRun]
      }
      throw new Error('Unimplemented')
    }
  }
}
