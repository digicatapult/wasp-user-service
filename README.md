# wasp-user-service

User service for `WASP`. Handles the storage and retrieval of users and the issuance of login tokens.

## Getting started

`wasp-user-service` can be run in a similar way to most nodejs application. First install required dependencies using `npm`:

```sh
npm install
```

`wasp-user-service` depends on a `postgresql` database dependency which can be brought locally up using docker:

```sh
docker-compose up -d
```

The database must be initialised with:

```sh
npx knex migrate:latest
```

And finally you can run the application in development mode with:

```sh
npm run dev
```

## Environment Variables

`wasp-user-service` is configured primarily using environment variables as follows:

| variable                 | required |            default            | description                                                                          |
| :----------------------- | :------: | :---------------------------: | :----------------------------------------------------------------------------------- |
| LOG_LEVEL                |    N     |            `info`             | Logging level. Valid values are [`trace`, `debug`, `info`, `warn`, `error`, `fatal`] |
| PORT                     |    N     |            `3000`             | Port on which the service will listen                                                |
| DB_HOST                  |    Y     |               -               | Hostname for the db                                                                  |
| DB_PORT                  |    N     |             5432              | Port to connect to the db                                                            |
| DB_NAME                  |    N     |            `users`            | Name of the database to connect to                                                   |
| DB_USERNAME              |    Y     |               -               | Username to connect to the database with                                             |
| DB_PASSWORD              |    Y     |               -               | Password to connect to the database with                                             |
| API_VERSION              |    N     |    `package.json version`     | Official API version                                                                 |
| API_MAJOR_VERSION        |    N     |             `v1`              | Major API version                                                                    |
| AUTH_SERVICE_HOST        |    N     | `wasp-authentication-service` | Authentication service host                                                          |
| AUTH_SERVICE_PORT        |    N     |             `80`              | Authentication service port                                                          |
| AUTH_SERVICE_API_VERSION |    N     |             `v1`              | Authentication service major API version                                             |
| AUTH_TOKEN_NAME          |    N     |            `login`            | Authentication service token name sent on the body of authentication service request |
| AUTH_TOKEN_EXPIRY        |    N     |              `1`              | Expiration of auth token in days                                                     |

## Database structure

The structure of the database backing `wasp-user-service` can be found in [docs/db.md](./docs/db.md)
