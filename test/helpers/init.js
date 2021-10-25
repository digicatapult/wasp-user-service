const { before } = require('mocha')

const { setupServer } = require('./server')

before(async function () {
  this.timeout(10000)
  await setupServer({})
})
