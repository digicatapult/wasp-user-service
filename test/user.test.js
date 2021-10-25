const { describe, before, beforeEach, afterEach, it } = require('mocha')
const { expect } = require('chai')
const bcrypt = require('bcrypt')
const jwt = require('jwt-simple')
const moment = require('moment')

const { setupServer } = require('./helpers/server')
const { API_MAJOR_VERSION } = require('../app/env')

const { addUser, cleanUsers, getUser } = require('./helpers/users')
const { assertAPIUserToDb } = require('./helpers/assert')
const { authServer } = require('./helpers/authMock')

describe('GET /user/current', function () {
  const context = {}
  before(async function () {
    await setupServer(context)
    await cleanUsers()
    context.adminUser = await addUser({ name: 'test-admin', role: 'admin' })
    context.regularUser = await addUser({ name: 'test-user', role: 'user' })
    context.disabledUser = await addUser({ name: 'removed-user', role: 'removed' })
  })

  after(async function () {
    await cleanUsers()
  })

  it('should return current user as admin', async function () {
    const response = await context.request
      .get(`/${API_MAJOR_VERSION}/user/current`)
      .set('User-Id', context.adminUser.id)
    expect(response.status).to.equal(200)
    assertAPIUserToDb(response.body, context.adminUser)
  })

  it('should return current user as user', async function () {
    const response = await context.request
      .get(`/${API_MAJOR_VERSION}/user/current`)
      .set('User-Id', context.regularUser.id)
    expect(response.status).to.equal(200)
    assertAPIUserToDb(response.body, context.regularUser)
  })

  it('should return 401 as removed user', async function () {
    const response = await context.request
      .get(`/${API_MAJOR_VERSION}/user/current`)
      .set('User-Id', context.disabledUser.id)
    expect(response.status).to.equal(401)
  })

  it('should return 401 without user-id header', async function () {
    const response = await context.request.get(`/${API_MAJOR_VERSION}/user/current`)
    expect(response.status).to.equal(401)
  })

  it('should return 401 with invalid user-id header', async function () {
    const response = await context.request.get(`/${API_MAJOR_VERSION}/user/current`).set('User-Id', 'not-a-uuid')
    expect(response.status).to.equal(401)
  })
})

describe('POST /login', async function () {
  const context = {}

  before(async function () {
    await cleanUsers()
    await authServer(context)
    await setupServer(context)
    const password_hash = await bcrypt.hash('regularUserPassword', 10)
    context.adminUser = await addUser({ name: 'test-admin', role: 'admin' })
    context.regularUser = await addUser({ name: 'test-user', role: 'user', password_hash })
    context.disabledUser = await addUser({ name: 'removed-user', role: 'removed' })
    context.regularUser.password = 'regularUserPassword'
  })

  after(async function () {
    await cleanUsers()
    await new Promise((resolve, reject) => {
      context.authServer.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
  it('should return a valid auth token and a valid expiry unix time', async function () {
    const response = await context.request
      .post(`/${API_MAJOR_VERSION}/login`)
      .set('Content-type', 'application/json')
      .send({ name: context.regularUser.name, password: context.regularUser.password })

    const { id, sub, expiry } = jwt.decode(response.body.token, 'jwt-secret')

    expect(response.status).to.equal(201)
    expect(response.body).to.haveOwnProperty('token')
    expect(response.body).to.haveOwnProperty('expiry')
    expect(moment.unix(response.body.expiry).isValid()).to.be.true
    expect(id).to.equal('auth-token-id')
    expect(sub).to.equal(context.regularUser.id)
    expect(expiry).to.equal(response.body.expiry)
  })
  it('should return 404 if the user does not exist', async () => {
    const response = await context.request
      .post(`/${API_MAJOR_VERSION}/login`)
      .set('Content-type', 'application/json')
      .send({ name: 'missingUser', password: 'weirdUsersPassword' })

    expect(response.status).to.equal(404)
  })
  it('should return 400 Bad Request if the user name or password are missing', async () => {
    const response1 = await context.request
      .post(`/${API_MAJOR_VERSION}/login`)
      .set('Content-type', 'application/json')
      .send({ name: '', password: 'password' })
    const response2 = await context.request
      .post(`/${API_MAJOR_VERSION}/login`)
      .set('Content-type', 'application/json')
      .send({ name: 'name', password: '' })

    expect(response1.status).to.equal(400)
    expect(response2.status).to.equal(400)
  })
  it('should return 401 if wrong password', async () => {
    const password = 'some-random-password'
    const response = await context.request
      .post(`/${API_MAJOR_VERSION}/login`)
      .set('Content-type', 'application/json')
      .send({ name: context.regularUser.name, password })

    expect(response.status).to.equal(401)
    expect(context.regularUser.password).to.not.equal(password)
  })
})

describe('GET /user/:id', function () {
  const context = {}
  before(async function () {
    await setupServer(context)
    await cleanUsers()
    context.adminUser = await addUser({ name: 'test-admin', role: 'admin' })
    context.regularUser = await addUser({ name: 'test-user', role: 'user' })
    context.disabledUser = await addUser({ name: 'removed-user', role: 'removed' })
  })

  after(async function () {
    await cleanUsers()
  })

  it('should return requested user as admin', async function () {
    const response = await context.request
      .get(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .set('User-Id', context.adminUser.id)
    expect(response.status).to.equal(200)
    assertAPIUserToDb(response.body, context.regularUser)
  })

  it('should return 401 as regular user', async function () {
    const response = await context.request
      .get(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .set('User-Id', context.regularUser.id)
    expect(response.status).to.equal(401)
  })

  it('should return 401 as removed user', async function () {
    const response = await context.request
      .get(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .set('User-Id', context.disabledUser.id)
    expect(response.status).to.equal(401)
  })

  it('should return 401 without user-id header', async function () {
    const response = await context.request.get(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
    expect(response.status).to.equal(401)
  })

  it('should return 401 with invalid user-id header', async function () {
    const response = await context.request
      .get(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .set('User-Id', 'not-a-uuid')
    expect(response.status).to.equal(401)
  })

  it('should return 400 as with bad uuid as admin', async function () {
    const response = await context.request.get(`/${API_MAJOR_VERSION}/user/foo`).set('User-Id', context.adminUser.id)
    expect(response.status).to.equal(400)
  })

  it('should return 404 as with incorrect uuid as admin', async function () {
    const response = await context.request
      .get(`/${API_MAJOR_VERSION}/user/00000000-0000-0000-0000-000000000000`)
      .set('User-Id', context.adminUser.id)
    expect(response.status).to.equal(404)
  })
})

describe('PATCH /user/:id', function () {
  const context = {}
  before(async function () {
    await setupServer(context)
    await cleanUsers()
  })

  beforeEach(async function () {
    context.adminUser = await addUser({ name: 'test-admin', role: 'admin' })
    context.regularUser = await addUser({ name: 'test-user', role: 'user' })
    context.disabledUser = await addUser({ name: 'removed-user', role: 'removed' })
  })

  afterEach(async function () {
    await cleanUsers()
  })

  it('should update user name as admin', async function () {
    const response = await context.request
      .patch(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .set('User-Id', context.adminUser.id)
      .send({ name: 'test-user-updated' })
    expect(response.status).to.equal(200)
    assertAPIUserToDb(response.body, { ...context.regularUser, name: 'test-user-updated' })

    const dbUser = await getUser(context.regularUser.id)
    expect(dbUser.name).to.equal('test-user-updated')
    expect(dbUser.role).to.equal('user')
  })

  it('should update user role as admin', async function () {
    const response = await context.request
      .patch(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .set('User-Id', context.adminUser.id)
      .send({ role: 'admin' })
    expect(response.status).to.equal(200)
    assertAPIUserToDb(response.body, { ...context.regularUser, role: 'admin' })

    const dbUser = await getUser(context.regularUser.id)
    expect(dbUser.name).to.equal('test-user')
    expect(dbUser.role).to.equal('admin')
  })

  it('should update user and and role as admin', async function () {
    const response = await context.request
      .patch(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .set('User-Id', context.adminUser.id)
      .send({ name: 'test-user-updated', role: 'admin' })
    expect(response.status).to.equal(200)
    assertAPIUserToDb(response.body, { ...context.regularUser, role: 'admin', name: 'test-user-updated' })

    const dbUser = await getUser(context.regularUser.id)
    expect(dbUser.name).to.equal('test-user-updated')
    expect(dbUser.role).to.equal('admin')
  })

  it('should return 401 as regular user', async function () {
    const response = await context.request
      .patch(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .set('User-Id', context.regularUser.id)
      .send({ name: 'test-user-updated', role: 'admin' })
    expect(response.status).to.equal(401)
  })

  it('should return 401 as removed user', async function () {
    const response = await context.request
      .patch(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .set('User-Id', context.disabledUser.id)
      .send({ name: 'test-user-updated', role: 'admin' })
    expect(response.status).to.equal(401)
  })

  it('should return 401 without user-id header', async function () {
    const response = await context.request
      .patch(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .send({ name: 'test-user-updated', role: 'admin' })
    expect(response.status).to.equal(401)
  })

  it('should return 401 with invalid user-id header', async function () {
    const response = await context.request
      .patch(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .set('User-Id', 'not-a-uuid')
      .send({ name: 'test-user-updated', role: 'admin' })
    expect(response.status).to.equal(401)
  })

  it('should return 404 with non-existent user', async function () {
    const response = await context.request
      .patch(`/${API_MAJOR_VERSION}/user/00000000-0000-0000-0000-000000000000`)
      .set('User-Id', context.adminUser.id)
      .send({ name: 'test-user-updated', role: 'admin' })
    expect(response.status).to.equal(404)
  })

  it('should return 400 with invalid user uuid', async function () {
    const response = await context.request
      .patch(`/${API_MAJOR_VERSION}/user/hello`)
      .set('User-Id', context.adminUser.id)
      .send({ name: 'test-user-updated', role: 'admin' })
    expect(response.status).to.equal(400)
  })

  it('should return 400 with empty name', async function () {
    const response = await context.request
      .patch(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .set('User-Id', context.adminUser.id)
      .send({ name: '' })
    expect(response.status).to.equal(400)
  })

  it('should return 400 with invalid role', async function () {
    const response = await context.request
      .patch(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .set('User-Id', context.adminUser.id)
      .send({ role: 'invalid' })
    expect(response.status).to.equal(400)
  })

  it('should return 409 with name change is exists', async function () {
    const response = await context.request
      .patch(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .set('User-Id', context.adminUser.id)
      .send({ name: context.adminUser.name })
    expect(response.status).to.equal(409)
  })

  it('should succeed with name change if name is same', async function () {
    const response = await context.request
      .patch(`/${API_MAJOR_VERSION}/user/${context.regularUser.id}`)
      .set('User-Id', context.adminUser.id)
      .send({ name: context.regularUser.name })
    expect(response.status).to.equal(200)
    assertAPIUserToDb(response.body, context.regularUser)
  })
})
