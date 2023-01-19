import env from '../env.js'

const { PORT, API_VERSION } = env

const apiDoc = {
  openapi: '3.0.3',
  info: {
    title: 'UserService',
    version: API_VERSION,
  },
  servers: [
    {
      url: `http://localhost:${PORT}/v1`,
    },
  ],
  components: {
    responses: {
      NotFoundError: {
        description: 'This resource cannot be found',
      },
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
      },
      BadRequestError: {
        description: 'The request is invalid',
      },
      ConflictError: {
        description: 'This resource already exists',
      },
      Error: {
        description: 'Something went wrong',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            description: 'Id of the user',
            type: 'string',
          },
          name: {
            description: 'Name of the user',
            type: 'string',
          },
          role: {
            description: 'Role of the user',
            type: 'string',
            enum: ['user', 'admin', 'removed'],
          },
        },
        required: ['id', 'name', 'role'],
      },
      UserWithPassword: {
        type: 'object',
        properties: {
          id: {
            description: 'Id of the user',
            type: 'string',
          },
          name: {
            description: 'Name of the user',
            type: 'string',
          },
          role: {
            description: 'Role of the user',
            type: 'string',
            enum: ['user', 'admin', 'removed'],
          },
          password: {
            description: 'Password for the new user',
            type: 'string',
          },
        },
        required: ['id', 'name', 'role', 'password'],
      },
      Login: {
        type: 'object',
        properties: {
          name: {
            description: 'Name of the user',
            type: 'string',
          },
          password: {
            description: 'Password for the new user',
            type: 'string',
          },
        },
        required: ['name', 'password'],
      },
    },
  },
  paths: {},
}

export default apiDoc
