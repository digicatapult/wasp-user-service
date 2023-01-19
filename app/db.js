import knex from 'knex'

import env from './env.js'

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

const findUsers = async ({ userId, name }) => {
  const query = client('users')
    .select(['id', 'name', 'role', 'created_by_id AS createdBy', 'created_at AS createdAt'])
    .orderBy('id', 'ASC')
  if (userId) {
    return query.where({ id: userId })
  }
  if (name) {
    return query.where({ name })
  }
  return query
}

const getUserPassword = async ({ userId }) => {
  const query = await client('users').select(['password_hash as passwordHash']).where({ id: userId })
  return query[0]
}

const createUser = async (newUser) => {
  const [user] = await client('users')
    .insert(newUser)
    .returning(['id', 'name', 'role', 'created_at AS createdAt', 'created_by_id AS createdBy'])
  return user
}

const updateUser = async ({ userId, ...update }) => {
  const [user] = await client('users')
    .update({ ...update, updated_at: new Date().toISOString() })
    .where({ id: userId })
    .returning(['id', 'name', 'role', 'created_by_id AS createdBy', 'created_at AS createdAt'])

  return user
}

export { client, findUsers, getUserPassword, createUser, updateUser }
