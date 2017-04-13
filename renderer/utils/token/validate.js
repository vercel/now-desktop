import Client from 'now-client'

export default async token => {
  if (!token) {
    return
  }

  const now = new Client(token)

  try {
    await now.getDeployments()
  } catch (err) {
    console.log('Token within .now.json is not valid')
    console.log('Just ignore the error above')

    return false
  }

  return true
}
