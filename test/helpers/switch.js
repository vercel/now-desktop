module.exports = async ({ client }, wish) => {
  const { value } = await client.windowHandles()

  for (const frame of value) {
    await client.window(frame)

    const url = await client.getUrl()
    const path = `${wish}/index.html`

    if (url.includes(path)) {
      return true
    }
  }

  return false
}
