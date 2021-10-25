const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jwt-simple')
const moment = require('moment')

const { AUTH_SERVICE_PORT, AUTH_SERVICE_API_VERSION } = require('../../app/env')

const authServer = async (context) => {
  const app = express()
  app.use(bodyParser.json({ type: 'application/json' }))

  app.post(`/${AUTH_SERVICE_API_VERSION}/user/:userId/token`, async (req, res) => {
    const { userId } = req.params
    const { name, expiry } = req.body
    const userIdHeader = req.headers['user-id']

    const token = jwt.encode(
      {
        id: 'auth-token-id',
        expiry,
        sub: userId,
      },
      'jwt-secret'
    )

    const isExpiryValid = moment.unix(expiry).isValid()

    if (!name || !expiry || !isExpiryValid) {
      res.status(400).json({})
    } else if (userIdHeader !== userId) {
      res.status(401).json({})
    } else {
      res.status(201).json({ token, expiry })
    }
  })

  await new Promise((resolve, reject) => {
    const server = app.listen(AUTH_SERVICE_PORT, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
    context.authServer = server
  })
}

module.exports = { authServer }
