// Native
const { createHash } = require('crypto')

module.exports = () => {
  const pre = Math.random().toString()
  return createHash('sha1')
    .update(pre)
    .digest('hex')
}
