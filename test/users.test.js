import { describe, before, beforeEach, afterEach, it } from 'mocha'
import { expect } from 'chai'

import { setupServer } from './helpers/server.js'

import { addUser, sortUsers, cleanUsers, getUserByName } from './helpers/users.js'
import { assertNewUser, assertListAPItoDb } from './helpers/assert.js'

describe('GET /user', function () {
  const context = {}
  before(async function () {
    await setupServer(context)
    await cleanUsers()
    context.adminUser = await addUser({ name: 'test-admin', role: 'admin' })
    context.regularUser = await addUser({ name: 'test-user', role: 'user' })
    context.disabledUser = await addUser({ name: 'removed-user', role: 'removed' })
    context.rootUser = await getUserByName('admin')
    context.users = sortUsers([context.adminUser, context.regularUser, context.disabledUser, context.rootUser])
  })

  after(async function () {
    await cleanUsers()
  })

  it('should return users as admin', async function () {
    const response = await context.request.get(`/v1/user`).set('User-Id', context.adminUser.id)
    expect(response.status).to.equal(200)
    assertListAPItoDb(response.body, context.users)
  })

  it('should return 401 as regular user', async function () {
    const response = await context.request.get(`/v1/user`).set('User-Id', context.regularUser.id)
    expect(response.status).to.equal(401)
  })

  it('should return 401 as removed user', async function () {
    const response = await context.request.get(`/v1/user`).set('User-Id', context.disabledUser.id)
    expect(response.status).to.equal(401)
  })

  it('should return 401 without user-id header', async function () {
    const response = await context.request.get(`/v1/user`)
    expect(response.status).to.equal(401)
  })

  it('should return 401 with invalid user-id header', async function () {
    const response = await context.request.get(`/v1/user`).set('User-Id', 'not-a-uuid')
    expect(response.status).to.equal(401)
  })
})

describe('POST /user', function () {
  const context = {}
  before(async function () {
    await setupServer(context)
    await cleanUsers()
  })

  beforeEach(async function () {
    context.adminUser = await addUser({ name: 'test-admin', role: 'admin' })
    context.regularUser = await addUser({ name: 'test-user', role: 'user' })
    context.disabledUser = await addUser({ name: 'removed-user', role: 'removed' })
    context.rootUser = await getUserByName('admin')
    context.users = sortUsers([context.adminUser, context.regularUser, context.disabledUser, context.rootUser])
  })

  afterEach(async function () {
    await cleanUsers()
  })

  it('should return new user as admin', async function () {
    const input = { name: 'New User', role: 'user' }
    const response = await context.request.post(`/v1/user`).set('User-Id', context.adminUser.id).send(input)
    expect(response.status).to.equal(201)
    assertNewUser(response.body, { ...input, createdBy: context.adminUser.id })
  })

  it('should new user in list', async function () {
    const input = { name: 'New User', role: 'user' }
    await context.request.post(`/v1/user`).set('User-Id', context.adminUser.id).send(input)

    const response = await context.request.get(`/v1/user`).set('User-Id', context.adminUser.id)
    expect(response.status).to.equal(200)
    const newUser = await getUserByName(input.name)
    const users = sortUsers([...context.users, newUser])

    assertListAPItoDb(response.body, users)
  })

  it('should return new admin as admin', async function () {
    const input = { name: 'New Admin', role: 'admin' }
    const response = await context.request.post(`/v1/user`).set('User-Id', context.adminUser.id).send(input)
    expect(response.status).to.equal(201)
    assertNewUser(response.body, { ...input, createdBy: context.adminUser.id })
  })

  it('should return 401 as regular user', async function () {
    const input = { name: 'New User', role: 'user' }
    const response = await context.request.post(`/v1/user`).set('User-Id', context.regularUser.id).send(input)
    expect(response.status).to.equal(401)
  })

  it('should return 401 as removed user', async function () {
    const input = { name: 'New User', role: 'user' }
    const response = await context.request.post(`/v1/user`).set('User-Id', context.disabledUser.id).send(input)
    expect(response.status).to.equal(401)
  })

  it('should return 401 without user-id header', async function () {
    const input = { name: 'New User', role: 'user' }
    const response = await context.request.post(`/v1/user`).send(input)
    expect(response.status).to.equal(401)
  })

  it('should return 401 with invalid user-id header', async function () {
    const input = { name: 'New User', role: 'user' }
    const response = await context.request.post(`/v1/user`).set('User-Id', 'not-a-uuid').send(input)
    expect(response.status).to.equal(401)
  })

  it('should return 400 with bad role', async function () {
    const input = { name: 'New User', role: 'wibble' }
    const response = await context.request.post(`/v1/user`).set('User-Id', context.adminUser.id).send(input)
    expect(response.status).to.equal(400)
  })

  it('should return 400 with no role', async function () {
    const input = { name: 'New User' }
    const response = await context.request.post(`/v1/user`).set('User-Id', context.adminUser.id).send(input)
    expect(response.status).to.equal(400)
  })

  it('should return 400 with empty name', async function () {
    const input = { name: '', role: 'user' }
    const response = await context.request.post(`/v1/user`).set('User-Id', context.adminUser.id).send(input)
    expect(response.status).to.equal(400)
  })

  it('should return 400 with no name', async function () {
    const input = { role: 'user' }
    const response = await context.request.post(`/v1/user`).set('User-Id', context.adminUser.id).send(input)
    expect(response.status).to.equal(400)
  })

  it('should return 409 with duplicate name', async function () {
    const input = { name: context.regularUser.name, role: 'user' }
    const response = await context.request.post(`/v1/user`).set('User-Id', context.adminUser.id).send(input)
    expect(response.status).to.equal(409)
  })
})
