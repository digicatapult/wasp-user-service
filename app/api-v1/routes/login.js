export default function (userService) {
  const doc = {
    POST: async function login(req, res) {
      const { name, password } = req.body

      const { statusCode, result } = await userService.login({ name, password })

      res.status(statusCode).json(result)
    },
  }

  doc.POST.apiDoc = {
    summary: 'Login',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Unique user name',
                minLength: 1,
              },
              password: {
                type: 'string',
                description: 'The password for the user',
                minLength: 1,
              },
            },
            required: ['name', 'password'],
          },
        },
      },
    },
    responses: {
      201: {
        description: 'User logged in successfully',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Login',
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
      404: {
        description: 'User does not exist',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/NotFoundError',
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
    security: [],
    tags: ['auth'],
  }

  return doc
}
