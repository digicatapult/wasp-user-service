import validator from 'validator'

const isUuidInvalid = (uuid) => {
  return !uuid || !validator.isUUID(uuid)
}

const validRoles = ['admin', 'user']
const validateNewUser = ({ name, role }) => {
  if (!name || typeof name !== 'string') {
    return null
  }

  if (validRoles.indexOf(role) === -1) {
    return null
  }

  return { name, role }
}

export { isUuidInvalid, validateNewUser }
