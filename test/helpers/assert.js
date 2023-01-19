import { expect } from 'chai'

import { assertPasswordValid } from '../../app/passwords.js'

const assertNewUser = (result, input) => {
  expect(result.id).to.be.a('string')
  expect(result.name).to.equal(input.name)
  expect(result.role).to.equal(input.role)
  expect(result.password).to.be.a('string')
  expect(result.createdAt).to.be.a('string')
  expect(result.createdBy).to.equal(input.createdBy)

  // note this assertion simply is testing that the password returned is compatible
  // with the otherwise defined password checking function. This is not guaranteeing
  // that the password is good (there should be a unit test for that)
  assertPasswordValid(result.password)
}

const assertAPIUserToDb = (apiUser, dbUser) => {
  expect(apiUser.id).to.equal(dbUser.id)
  expect(apiUser.name).to.equal(dbUser.name)
  expect(apiUser.role).to.equal(dbUser.role)
  expect(apiUser.createdAt).to.equal(dbUser.created_at.toISOString())
  expect(apiUser.createdBy).to.equal(dbUser.created_by_id)
}

const assertListAPItoDb = (apiUsers, dbUsers) => {
  for (let userIndex = 0; userIndex < dbUsers.length; userIndex++) {
    assertAPIUserToDb(apiUsers[userIndex], dbUsers[userIndex])
  }
}

export { assertNewUser, assertAPIUserToDb, assertListAPItoDb }
