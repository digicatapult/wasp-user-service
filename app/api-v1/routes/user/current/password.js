import { isUuidInvalid } from '../../../../validatorUtil.js'

export default function (userService) {
  const doc = {
    PUT: async function updateUserPasswordHandler(req, res) {
      const currentUserId = req.headers['user-id']
      const password = req.body.password

      if (!currentUserId || isUuidInvalid(currentUserId)) {
        res.status(401).json({})
        return
      }

      const user = await userService.getUser({ userId: currentUserId })
      if (!user || user.role === 'removed') {
        res.status(401).json({})
        return
      }

      const { statusCode, result } = await userService.putUserPassword({ userId: currentUserId, password })
      res.status(statusCode).json(result)
      return
    },
  }

  doc.PUT.apiDoc = {
    summary: 'Update current user password',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              password: {
                type: 'string',
                description: 'New password to set for the current user',
              },
            },
            required: ['password'],
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Password updated successfully',
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
