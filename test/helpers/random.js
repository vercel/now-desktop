// Native
const { createHash } = require('crypto')

module.exports = length => {
  const pre = Math.random().toString()
  const generator = createHash('sha1').update(pre)
  const hash = generator.digest('hex')

  if (length) {
    return hash.substr(0, length)
  }

  return hash
}
