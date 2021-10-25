const pino = require('pino')
const env = require('./env')

const logger = pino(
  {
    name: 'WASP_USER_SERVICE_INIT_ADMIN',
    level: env.LOG_LEVEL,
  },
  process.stdout
)

logger.debug('Environment variables: %j', { ...env })

module.exports = logger
