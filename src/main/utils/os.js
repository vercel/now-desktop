export default name => {
  const osMap = {}

  osMap.windows = 'win32'
  osMap.macOS = 'darwin'

  return process.platform === osMap[name]
}
