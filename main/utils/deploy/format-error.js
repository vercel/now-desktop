// Native
const { relative } = require('path')

module.exports = async (response, files, path) => {
  const error = new Error()

  if (response.status >= 400 && response.status < 500) {
    let body = {}

    try {
      ;({ error: body } = await response.json())
    } catch (err) {}

    Object.assign(error, body)
    error.userError = true
  } else {
    error.userError = false
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After')

    if (retryAfter) {
      error.retryAfter = parseInt(retryAfter, 10)
    }
  }

  if (Array.isArray(files) && files.length > 0) {
    error.files = path ? files.map(file => relative(path, file)) : files
  }

  error.status = response.status
  return error
}
