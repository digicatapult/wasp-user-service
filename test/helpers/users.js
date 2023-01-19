import knex from 'knex'

import env from '../../app/env.js'

const client = knex({
  client: 'pg',
  migrations: {
    tableName: 'migrations',
  },
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
})

const addUser = async ({ name, role, password_hash = '' }) => {
  const [{ id: adminId }] = await client('users').select().where({ name: 'admin' })
  const [{ id }] = await client('users').insert({ name, role, password_hash, created_by_id: adminId }).returning(['id'])
  return getUser(id)
}

const removeUser = async (user) => {
  await client('users').del().where({ id: user.id })
}

const cleanUsers = async () => {
  await client('users').del().whereNot({ name: 'admin' })
}

const getUser = async (userId) => {
  const [user] = await client('users').where({ id: userId })
  return user
}

const getUserByName = async (name) => {
  const [user] = await client('users').where({ name })
  return user
}

const sortUsers = (users) => [...users].sort((a, b) => (a.id < b.id ? -1 : 1))

export { addUser, removeUser, sortUsers, cleanUsers, getUser, getUserByName }
