const fs = require('fs')
const { promisify } = require('util')

const { clipboard } = require('electron')
const plist = require('plist')
const tmp = require('tmp-promise')

const deploy = require('./deploy')

const writeFile = promisify(fs.writeFile)

const clipboards = [
  { type: 'plist', name: 'NSFilenamesPboardType' },
  { type: 'file', name: 'public.png', ext: '.png' },
  { type: 'file', name: 'Apple PNG pasteboard type', ext: '.png' }
]

exports.getClipboardContents = async forDeployment => {
  for (const { type, name, ext } of clipboards) {
    let pboardContents = clipboard.read(name)
    if (pboardContents && pboardContents.length > 0) {
      switch (type) {
        case 'plist':
          return plist.parse(pboardContents)
        case 'file':
          if (forDeployment) {
            pboardContents = clipboard.readBuffer(name)
            const { path } = await tmp.file({ postfix: ext })
            await writeFile(path, pboardContents)
            return [path]
          }
          return ['clipboard image']
        default:
          throw new Error(
            'Unexpected Error: A clipboard name is missing a type'
          )
      }
    }
  }
  return []
}

exports.deploy = async () => {
  const clipboardContents = await exports.getClipboardContents(true)
  if (clipboardContents.length > 0) {
    return deploy(clipboardContents)
  }
  throw new Error('Failed to deploy from clipobard: Clipboard is empty')
}
