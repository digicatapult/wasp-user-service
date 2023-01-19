import { isUuidInvalid, validateNewUser } from '../../validatorUtil.js'

export default function (userService) {
  const doc = {
    GET: async function listUsersHandler(req, res) {
      const userId = req.headers['user-id']

      if (!userId || isUuidInvalid(userId)) {
        res.status(401).json({})
        return
      }

      const user = await userService.getUser({ userId })
      if (!user || user.role !== 'admin') {
        res.status(401).json({})
        return
      }

      const { statusCode, result } = await userService.getUsers()
      res.status(statusCode).json(result)
    },
    POST: async function createUserHandler(req, res) {
      const userId = req.headers['user-id']
      if (!userId || isUuidInvalid(userId)) {
        res.status(401).json({})
        return
      }

      const user = await userService.getUser({ userId })
      if (!user || user.role !== 'admin') {
        res.status(401).json({})
        return
      }

      const newUser = validateNewUser(req.body)
      if (!newUser) {
        res.status(400).json({})
        return
      }

      const { statusCode, result } = await userService.postUser(userId, newUser)
      res.status(statusCode).json(result)
    },
  }

  doc.GET.apiDoc = {
    summary: 'Get users',
    responses: {
      200: {
        description: 'Return users',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User',
              },
            },
          },
        },
      },
      401: {
        description: 'An unauthorized error occurred',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/UnauthorizedError',
            },
          },
        },
      },
      default: {
        description: 'An error occurred',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/Error',
            },
          },
        },
      },
    },
    tags: ['users'],
  }

  doc.POST.apiDoc = {
    summary: 'Create user',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
              role: {
                type: 'string',
                enum: ['user', 'admin'],
              },
            },
            required: ['name', 'role'],
          },
        },
      },
    },
    responses: {
      201: {
        description: 'User created successfully',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UserWithPassword',
            },
          },
        },
      },
      400: {
        description: 'Invalid request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/BadRequestError',
            },
          },
        },
      },
      401: {
        description: 'An unauthorized error occurred',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/UnauthorizedError',
            },
          },
        },
      },
      409: {
        description: 'Resource already exists',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/ConflictError',
            },
          },
        },
      },
      default: {
        description: 'An error occurred',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/Error',
            },
          },
        },
      },
    },
    tags: ['users'],
  }

  return doc
}
