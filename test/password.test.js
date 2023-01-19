import { describe, before, beforeEach, afterEach, it } from 'mocha'
import { expect } from 'chai'
import bcrypt from 'bcrypt'

import { setupServer } from './helpers/server.js'
import { addUser, sortUsers, cleanUsers, getUser } from './helpers/users.js'
import { assertAPIUserToDb } from './helpers/assert.js'

const validPassword = 'aA0$0000'
const invalidPasswordCases = [
  { name: 'no lowercase', value: 'ZA0$0000' },
  { name: 'no uppercase', value: 'az0$0000' },
  { name: 'no number', value: 'aAa$zzzz' },
  { name: 'no special', value: 'aA0z0000' },
  { name: 'too short', value: 'aA0$000' },
]

describe('PUT /user/current/password', function () {
  const context = {}
  before(async function () {
    await setupServer(context)
    await cleanUsers()
  })

  beforeEach(async function () {
    context.adminUser = await addUser({ name: 'test-admin', role: 'admin' })
    context.regularUser = await addUser({ name: 'test-user', role: 'user' })
    context.disabledUser = await addUser({ name: 'removed-user', role: 'removed' })
    context.users = sortUsers([context.adminUser, context.regularUser, context.disabledUser])
  })

  afterEach(async function () {
    await cleanUsers()
  })

  it('should update current user password as admin', async function () {
    const response = await context.request
      .put(`/v1/user/current/password`)
      .set('User-Id', context.adminUser.id)
      .send({ password: validPassword })
    const { password_hash } = await getUser(context.adminUser.id)
    const passwordCompare = await bcrypt.compare(validPassword, password_hash)

    expect(response.status).to.equal(200)
    assertAPIUserToDb(response.body, context.adminUser)
    expect(passwordCompare).to.equal(true)
  })

  it('should update current user password as user', async function () {
    const response = await context.request
      .put(`/v1/user/current/password`)
      .set('User-Id', context.regularUser.id)
      .send({ password: validPassword })
    const { password_hash } = await getUser(context.regularUser.id)
    const passwordCompare = await bcrypt.compare(validPassword, password_hash)

    expect(response.status).to.equal(200)
    assertAPIUserToDb(response.body, context.regularUser)
    expect(passwordCompare).to.equal(true)
  })

  it('should return 401 as removed user', async function () {
    const response = await context.request
      .put(`/v1/user/current/password`)
      .set('User-Id', context.disabledUser.id)
      .send({ password: validPassword })
    const { password_hash } = await getUser(context.disabledUser.id)
    const passwordCompare = await bcrypt.compare(validPassword, password_hash)

    expect(response.status).to.equal(401)
    expect(passwordCompare).to.equal(false)
  })

  it('should return 401 without user-id header', async function () {
    const response = await context.request.put(`/v1/user/current/password`).send({ password: validPassword })
    expect(response.status).to.equal(401)
  })

  it('should return 401 with invalid user-id header', async function () {
    const response = await context.request
      .put(`/v1/user/current/password`)
      .set('User-Id', 'not-a-uuid')
      .send({ password: validPassword })
    expect(response.status).to.equal(401)
  })

  it(`should 400 with no password`, async function () {
    const response = await context.request
      .put(`/v1/user/current/password`)
      .set('User-Id', context.adminUser.id)
      .send({})
    const { password_hash } = await getUser(context.adminUser.id)
    const passwordCompare = await bcrypt.compare(validPassword, password_hash)

    expect(response.status).to.equal(400)
    expect(passwordCompare).to.equal(false)
  })

  for (const { name, value } of invalidPasswordCases) {
    it(`should 400 with bad password (${name})`, async function () {
      const response = await context.request
        .put(`/v1/user/current/password`)
        .set('User-Id', context.adminUser.id)
        .send({ password: value })
      const { password_hash } = await getUser(context.adminUser.id)
      const passwordCompare = await bcrypt.compare(validPassword, password_hash)

      expect(response.status).to.equal(400)
      expect(passwordCompare).to.equal(false)
    })
  }
})

describe('PUT /user/:id/password', function () {
  const context = {}
  before(async function () {
    await setupServer(context)
    await cleanUsers()
  })

  beforeEach(async function () {
    context.adminUser = await addUser({ name: 'test-admin', role: 'admin' })
    context.regularUser = await addUser({ name: 'test-user', role: 'user' })
    context.disabledUser = await addUser({ name: 'removed-user', role: 'removed' })
    context.users = sortUsers([context.adminUser, context.regularUser, context.disabledUser])
  })

  afterEach(async function () {
    await cleanUsers()
  })

  it('should update specified user password as admin', async function () {
    const response = await context.request
      .put(`/v1/user/${context.regularUser.id}/password`)
      .set('User-Id', context.adminUser.id)
      .send({})
    const { password_hash } = await getUser(context.regularUser.id)
    const passwordCompare = await bcrypt.compare(response.body.password, password_hash)

    expect(response.status).to.equal(200)
    assertAPIUserToDb(response.body, context.regularUser)
    expect(response.body.password).to.be.a('string')
    expect(passwordCompare).to.equal(true)
  })

  it('should return 401 as regular user', async function () {
    const response = await context.request
      .put(`/v1/user/${context.regularUser.id}/password`)
      .set('User-Id', context.regularUser.id)
      .send({})
    expect(response.status).to.equal(401)
  })

  it('should return 401 as removed user', async function () {
    const response = await context.request
      .put(`/v1/user/${context.regularUser.id}/password`)
      .set('User-Id', context.disabledUser.id)
      .send({})
    expect(response.status).to.equal(401)
  })

  it('should return 401 as without user-id header', async function () {
    const response = await context.request.put(`/v1/user/${context.regularUser.id}/password`).send({})
    expect(response.status).to.equal(401)
  })

  it('should return 401 with invalid user-id header', async function () {
    const response = await context.request
      .put(`/v1/user/${context.regularUser.id}/password`)
      .set('User-Id', 'not-a-uuid')
      .send({})
    expect(response.status).to.equal(401)
  })

  it('should return 400 with invalid user uuid', async function () {
    const response = await context.request.put(`/v1/user/foo/password`).set('User-Id', context.adminUser.id).send({})
    expect(response.status).to.equal(400)
  })

  it("should return 404 when user doesn't exist", async function () {
    const response = await context.request
      .put(`/v1/user/00000000-0000-0000-0000-000000000000/password`)
      .set('User-Id', context.adminUser.id)
      .send({})
    expect(response.status).to.equal(404)
  })
})
