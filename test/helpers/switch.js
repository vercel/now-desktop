module.exports = async ({ client }, wish) => {
  const { value } = await client.windowHandles()

  for (const frame of value) {
    // eslint-disable-next-line no-await-in-loop
    await client.window(frame)

    // eslint-disable-next-line no-await-in-loop
    const url = await client.getUrl()
    const path = `${wish}/index.html`

    if (url.includes(path)) {
      return true
    }
  }

  return false
}
