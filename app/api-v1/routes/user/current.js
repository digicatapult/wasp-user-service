import { isUuidInvalid } from '../../../validatorUtil.js'

export default function (userService) {
  const doc = {
    GET: async function getUserHandler(req, res) {
      const currentUserId = req.headers['user-id']

      if (!currentUserId || isUuidInvalid(currentUserId)) {
        res.status(401).json({})
        return
      }

      const user = await userService.getUser({ userId: currentUserId })
      if (!user || user.role === 'removed') {
        res.status(401).json({})
        return
      }

      res.status(200).json(user)
    },
  }

  doc.GET.apiDoc = {
    summary: 'Get current user',
    responses: {
      200: {
        description: 'Return current user',
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
