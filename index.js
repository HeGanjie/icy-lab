// https://babeljs.io/docs/usage/babel-register/
require('babel-register')({
  presets: [ ['env', { "targets": { "node": "current", "browsers": "chrome >= 60" } }], "stage-0" ],
  ignore: /node_modules/
})

// Import the rest of our application.
module.exports = require('./src/index.js')
