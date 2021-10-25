const MIN_PASSWORD_LENGTH = 8

const { randomInt } = require('crypto')

const assertPasswordValid = (password) => {
  if (password.length < MIN_PASSWORD_LENGTH) throw new Error('Failed password validity - min 8 chars')
  if (password.search(/\d/) === -1) throw new Error('Failed password validity - must contain at least one number')
  if (password.search(/[a-z]/) === -1)
    throw new Error('Failed password validity - must contain at least one lowercase letter')
  if (password.search(/[A-Z]/) === -1)
    throw new Error('Failed password validity - must contain at least one uppercase letter')
  if (password.search(/[!@#$%^&*(),.?":{}|<>]/) === -1)
    throw new Error('Failed password validity - must contain at least one special character')
}

const characterGenerators = [
  function generateUpperCase() {
    return String.fromCodePoint(randomInt(65, 91))
  },
  function generateLowerCase() {
    return String.fromCodePoint(randomInt(97, 123))
  },
  function generateSpecial() {
    const specials = '!@#$%^&*(),.?":{}|<>'
    return specials[randomInt(specials.length)]
  },
  function generateDigit() {
    return String.fromCodePoint(randomInt(48, 58))
  },
]

const generatePassword = () => {
  // we need at least one of each password character type so include one of each
  const passwordCharGens = [...characterGenerators]
  // now extend to include additional random entries from these sets
  for (let i = characterGenerators.length; i < MIN_PASSWORD_LENGTH; i++) {
    passwordCharGens.push(characterGenerators[randomInt(characterGenerators.length)])
  }
  // shuffle array in place (Fisher–Yates)
  for (let i = passwordCharGens.length - 1; i > 0; i--) {
    const j = randomInt(i)
    const temp = passwordCharGens[i]
    passwordCharGens[i] = passwordCharGens[j]
    passwordCharGens[j] = temp
  }

  return passwordCharGens.map((g) => g()).join('')
}

module.exports = {
  assertPasswordValid,
  generatePassword,
}
