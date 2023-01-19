import bcrypt from 'bcrypt'
import env from './env.js'

const expiryDate = new Date()
expiryDate.setFullYear(2050)

export default async ({ knex, logger }) => {
  if (!env.ADMIN_PASSWORD) {
    throw new Error('Invalid or missing admin password')
  }

  logger.debug('Finding admin')
  const [{ id: adminId, password_hash: existingPasswordHash }] = await knex('users')
    .select(['id', 'password_hash'])
    .where({ name: 'admin' })

  logger.debug('Admin ID: %s', adminId)
  if (!adminId) {
    throw new Error('No admin user found')
  }

  // if we already have an admin password registered then return
  if (existingPasswordHash !== '') {
    logger.info('Admin credentials exist already. Skipping insert')
    return
  }

  logger.debug('Inserting admin credentials')
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10)
  await knex('users').update({
    password_hash: passwordHash,
  })
  logger.info('Admin credentials inserted')
}
