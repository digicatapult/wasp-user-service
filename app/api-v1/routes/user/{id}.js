import { isUuidInvalid } from '../../../validatorUtil.js'

export default function (userService) {
  const doc = {
    GET: async function getUserHandler(req, res) {
      const currentUserId = req.headers['user-id']
      const requestedUserId = req.params.id

      if (!currentUserId || isUuidInvalid(currentUserId)) {
        res.status(401).json({})
        return
      }

      const user = await userService.getUser({ userId: currentUserId })
      if (!user || user.role !== 'admin') {
        res.status(401).json({})
        return
      }

      if (isUuidInvalid(requestedUserId)) {
        res.status(400).json({})
        return
      }

      const requestedUser = await userService.getUser({ userId: requestedUserId })
      if (!requestedUser) {
        res.status(404).json({})
        return
      }

      res.status(200).json(requestedUser)
    },
    PATCH: async function updateUserHandler(req, res) {
      const currentUserId = req.headers['user-id']
      const requestedUserId = req.params.id

      if (!currentUserId || isUuidInvalid(currentUserId)) {
        res.status(401).json({})
        return
      }

      const user = await userService.getUser({ userId: currentUserId })
      if (!user || user.role !== 'admin') {
        res.status(401).json({})
        return
      }

      if (isUuidInvalid(requestedUserId)) {
        res.status(400).json({})
        return
      }

      const { statusCode, result } = await userService.patchUser({
        userId: requestedUserId,
        name: req.body.name || undefined,
        role: req.body.role || undefined,
      })
      res.status(statusCode).json(result)
    },
  }

  doc.GET.apiDoc = {
    summary: 'Get user',
    responses: {
      200: {
        description: 'Return user',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/User',
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
      404: {
        description: 'The specified user does not exist',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/NotFoundError',
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

  doc.PATCH.apiDoc = {
    summary: 'Update user',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                minLength: 1,
              },
              role: {
                type: 'string',
                enum: ['user', 'admin', 'removed'],
              },
            },
            required: [],
          },
        },
      },
    },
    responses: {
      200: {
        description: 'User updated successfully',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/User',
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
      404: {
        description: 'The specified user does not exist',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/NotFoundError',
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
