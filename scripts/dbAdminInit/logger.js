import pino from 'pino'
import env from './env.js'

const logger = pino(
  {
    name: 'WASP_USER_SERVICE_INIT_ADMIN',
    level: env.LOG_LEVEL,
  },
  process.stdout
)

logger.debug('Environment variables: %j', { ...env })

export default logger
