const validatorUtil = require('../../../../validatorUtil')

module.exports = function (userService) {
  const doc = {
    PUT: async function updateUserPasswordHandler(req, res) {
      const currentUserId = req.headers['user-id']
      const requestedUserId = req.params.id

      if (!currentUserId || validatorUtil.isUuidInvalid(currentUserId)) {
        res.status(401).json({})
        return
      }

      const user = await userService.getUser({ userId: currentUserId })
      if (!user || user.role !== 'admin') {
        res.status(401).json({})
        return
      }

      if (validatorUtil.isUuidInvalid(requestedUserId)) {
        res.status(400).json({})
        return
      }

      const { statusCode, result } = await userService.putUserPassword({ userId: requestedUserId })
      res.status(statusCode).json(result)
    },
  }

  doc.PUT.apiDoc = {
    summary: 'Reset user password',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {},
            required: [],
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
