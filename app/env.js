import envalid from 'envalid'
import dotenv from 'dotenv'

import { version } from './version.js'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: 'test/test.env' })
} else {
  dotenv.config()
}

const vars = envalid.cleanEnv(
  process.env,
  {
    SERVICE_TYPE: envalid.str({ default: 'wasp-user-service'.toUpperCase().replace(/-/g, '_') }),
    LOG_LEVEL: envalid.str({ default: 'info', devDefault: 'debug' }),
    PORT: envalid.port({ devDefault: 3000 }),
    API_VERSION: envalid.str({ default: version }),

    DB_HOST: envalid.host({ devDefault: 'localhost' }),
    DB_PORT: envalid.port({ default: 5432 }),
    DB_NAME: envalid.str({ default: 'users' }),
    DB_USERNAME: envalid.str({ devDefault: 'postgres' }),
    DB_PASSWORD: envalid.str({ devDefault: 'postgres' }),

    AUTH_SERVICE_HOST: envalid.host({ default: 'wasp-authentication-service' }),
    AUTH_SERVICE_PORT: envalid.port({ default: 80 }),
    AUTH_SERVICE_API_VERSION: envalid.str({ default: 'v1' }),
    AUTH_TOKEN_NAME: envalid.str({ default: 'login' }),
    AUTH_TOKEN_EXPIRY: envalid.num({ default: 1 }), // days
  },
  {
    strict: true,
  }
)

export default vars
