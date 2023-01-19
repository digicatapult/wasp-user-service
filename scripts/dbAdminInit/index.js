import knex from 'knex'

import adminCredentialSeed from './admin_init.js'
import env from './env.js'
import logger from './logger.js'

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

const run = async () => {
  logger.info('Starting admin init')

  let hasErrored = false
  try {
    await adminCredentialSeed({ knex: client, logger })
    logger.info('Admin init complete')
  } catch (err) {
    logger.error('Error running admin init. Error was %s', err.message || err)
    hasErrored = true
  } finally {
    await client.destroy()
    process.exit(hasErrored ? 1 : 0)
  }
}

run()
