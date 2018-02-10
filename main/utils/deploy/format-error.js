module.exports = async response => {
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

  error.status = response.status
  return error
}
