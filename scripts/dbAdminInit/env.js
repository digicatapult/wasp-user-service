const envalid = require('envalid')

const vars = envalid.cleanEnv(
  process.env,
  {
    LOG_LEVEL: envalid.str({ default: 'info', choices: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] }),
    DB_HOST: envalid.host({ devDefault: 'localhost' }),
    DB_PORT: envalid.port({ default: 5432 }),
    DB_NAME: envalid.str({ default: 'users' }),
    DB_USERNAME: envalid.str({ devDefault: 'postgres' }),
    DB_PASSWORD: envalid.str({ devDefault: 'postgres' }),
    ADMIN_PASSWORD: envalid.str(),
  },
  {
    strict: true,
  }
)

module.exports = vars
