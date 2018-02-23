// Native
const { createHash } = require('crypto')

module.exports = () => {
  const pre = Math.random().toString()
  const generator = createHash('sha1').update(pre)

  return generator.digest('hex')
}
