// Packages
import {remote} from 'electron'

export default async (mail, token) => {
  const path = remote.require('path')
  const os = remote.require('os')
  const fs = remote.require('fs-promise')

  const filePath = path.join(os.homedir(), '.now.json')
  let currentContent = {}

  try {
    currentContent = await fs.readJSON(filePath)
  } catch (err) {}

  currentContent.email = mail
  currentContent.token = token

  const newContent = JSON.stringify(currentContent, null, 2)

  try {
    await fs.writeFile(filePath, newContent)
  } catch (err) {
    console.error(err)
  }
}
