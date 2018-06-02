const { clipboard } = require('electron')
const plist = require('plist')
const deploy = require('./deploy')

exports.onPaste = async () => {
  const pboardContents = clipboard.read('NSFilenamesPboardType')
  if (pboardContents.length > 0) {
    await deploy(plist.parse(pboardContents))
  }
}
