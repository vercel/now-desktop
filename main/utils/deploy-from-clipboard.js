const { clipboard } = require('electron')
const plist = require('plist')
const deploy = require('./deploy')

exports.getClipboardContents = () => {
  const pboardContents = clipboard.read('NSFilenamesPboardType')
  if (pboardContents.length > 0) {
    return plist.parse(pboardContents)
  }
  return []
}

exports.deploy = async () => {
  const clipboardContents = exports.getClipboardContents()
  if (clipboardContents.length > 0) {
    return deploy(clipboardContents)
  }
  throw new Error('Failed to deploy from clipobard: Clipboard is empty')
}
