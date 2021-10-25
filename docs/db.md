# Database usage

`wasp-user-service` is backed by a PostgreSQL database and is the canonical record of the users in a `WASP` instance.

## Database migrations

Database migrations are handled using [`knex.js`](https://knexjs.org/) and can be migrated manually using the following commands:

```sh
npx knex migrate:latest # used to migrate to latest database version
npx knex migrate:up # used to migrate to the next database version
npx knex migrate:down # used to migrate to the previous database version
```

## Table structure

The following tables exist in the `users` database.

### `users`

`users` represent the list of `users` that can use `WASP`.

#### Columns

| column          | PostreSQL type                     | nullable |       default        | description                                                 |
| :-------------- | :--------------------------------- | :------- | :------------------: | :---------------------------------------------------------- |
| `id`            | `UUID`                             | FALSE    | `uuid_generate_v4()` | Unique identifier for the `user`                            |
| `name`          | `CHARACTER VARYING(50)`            | FALSE    |          -           | Name of the user                                            |
| `role`          | `ENUM('admin', 'user', 'removed')` | FALSE    |          -           | Role for the user which can be `admin`, `user` or `removed` |
| `password_hash` | `CHARACTER VARYING(50)`            | FALSE    |          -           | Bcrypt hash of the user's password                          |
| `created_by_id` | `UUID`                             | FALSE    |          -           | User Id of the user who created this user                   |
| `created_at`    | `Timestamp with timezone`          | FALSE    |       `now()`        | When the row was first created                              |
| `updated_at`    | `Timestamp with timezone`          | FALSE    |       `now()`        | When the row was last updated                               |

#### Indexes

| columns | Index Type | description                                       |
| :------ | :--------- | :------------------------------------------------ |
| `id`    | PRIMARY    | Primary key                                       |
| `name`  | UNIQUE     | Ensures user names are uniquely defined in `WASP` |

#### Foreign Keys

| columns         | references  | description                                            |
| :-------------- | :---------- | :----------------------------------------------------- |
| `created_by_id` | `users(id)` | Ensures the user who created this user is a valid user |
