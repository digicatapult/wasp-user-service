exports.up = async (knex) => {
  // check extension is not installed
  const [extInstalled] = await knex('pg_extension').select('*').where({ extname: 'uuid-ossp' })

  if (!extInstalled) {
    await knex.raw('CREATE EXTENSION "uuid-ossp"')
  }

  const uuidGenerateV4 = () => knex.raw('uuid_generate_v4()')
  const now = () => knex.fn.now()

  await knex.schema.createTable('users', (def) => {
    def.uuid('id').primary().defaultTo(uuidGenerateV4())
    def.string('name').notNullable().unique()
    def.enu('role', ['user', 'admin', 'removed'], { useNative: true, enumName: 'users_role' }).notNullable()
    def.string('password_hash').notNullable()
    def.uuid('created_by_id').notNullable()
    def.datetime('created_at').notNullable().default(now())
    def.datetime('updated_at').notNullable().default(now())
  })

  const [id] = await knex('users')
    .insert({
      name: 'admin',
      role: 'admin',
      password_hash: '',
      created_by_id: uuidGenerateV4(),
    })
    .returning('id')

  await knex('users').update({ created_by_id: id }).where({ id })

  await knex.schema.alterTable('users', (def) => {
    def.foreign('created_by_id').references('id').on('users')
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTable('users')
  await knex.raw('DROP TYPE users_role')
}
