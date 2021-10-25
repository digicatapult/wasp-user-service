const bcrypt = require('bcrypt')
const fetch = require('node-fetch')
const moment = require('moment')
const {
  AUTH_SERVICE_HOST,
  AUTH_SERVICE_PORT,
  AUTH_SERVICE_API_VERSION,
  AUTH_TOKEN_NAME,
  AUTH_TOKEN_EXPIRY,
} = require('../../env')

const { findUsers, getUserPassword, createUser, updateUser } = require('../../db')
const { generatePassword, assertPasswordValid } = require('../../passwords')

const authApiPrefix = `http://${AUTH_SERVICE_HOST}:${AUTH_SERVICE_PORT}/${AUTH_SERVICE_API_VERSION}`

async function getUser({ userId, name }) {
  const result = await findUsers({ userId, name })
  if (result.length !== 1) {
    return null
  }
  return result[0]
}

async function getUsers() {
  const result = await findUsers({})

  if (result) {
    return { statusCode: 200, result }
  }

  return { statusCode: 500, result: {} }
}

async function postUser(createdByUserId, { name, role }) {
  const password = generatePassword()
  const password_hash = await bcrypt.hash(password, 10)

  // check user doesn't already exist
  const exists = await getUser({ name })
  if (exists) {
    return { statusCode: 409, result: {} }
  }

  // finally create them
  const result = await createUser({ name, role, password_hash, created_by_id: createdByUserId })
  if (result) {
    return { statusCode: 201, result: { ...result, password } }
  }

  return { statusCode: 500, result: {} }
}

async function patchUser({ userId, name, role }) {
  // check user exists
  const exists = await getUser({ userId })
  if (!exists) {
    return { statusCode: 404, result: {} }
  }

  // check user doesn't already exist if we're changing name
  if (name !== undefined) {
    const exists = await getUser({ name })
    if (exists && exists.id !== userId) {
      return { statusCode: 409, result: {} }
    }
  }

  // finally create them
  const result = await updateUser({ userId, name, role })
  if (result) {
    return { statusCode: 200, result }
  }

  return { statusCode: 500, result: {} }
}

async function putUserPassword({ userId, password: passwordInput }) {
  let password = passwordInput === undefined ? generatePassword() : passwordInput
  try {
    assertPasswordValid(password)
  } catch (err) {
    return { statusCode: 400, result: { message: err.message } }
  }
  const password_hash = await bcrypt.hash(password, 10)

  // check user doesn't already exist
  const exists = await getUser({ userId })
  if (!exists) {
    return { statusCode: 404, result: {} }
  }

  // finally create them
  const user = await updateUser({ userId, password_hash })
  if (!passwordInput) {
    return { statusCode: 200, result: { ...user, password } }
  }
  return { statusCode: 200, result: user }
}

async function login({ name: username, password: userPassword }) {
  // check if user exists
  const user = await getUser({ name: username })
  if (!user) {
    return { statusCode: 404, result: {} }
  }

  const { passwordHash } = await getUserPassword({ userId: user.id })

  // check wrong password
  if (!(await bcrypt.compare(userPassword, passwordHash))) {
    return { statusCode: 401, result: {} }
  }

  const expiry = moment().utc().add({ days: AUTH_TOKEN_EXPIRY }).unix()

  const res = await fetch(`${authApiPrefix}/user/${user.id}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'user-id': user.id },
    body: JSON.stringify({ name: AUTH_TOKEN_NAME, expiry }),
  })

  if (res.status !== 201) {
    return { statusCode: 401, result: {} }
  }

  const token = await res.json()
  return { statusCode: 201, result: token }
}

module.exports = {
  getUser,
  getUsers,
  postUser,
  patchUser,
  putUserPassword,
  login,
}
