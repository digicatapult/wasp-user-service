import { before } from 'mocha'

import { setupServer } from './server.js'

before(async function () {
  this.timeout(10000)
  await setupServer({})
})
