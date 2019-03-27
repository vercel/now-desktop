import { timeout } from 'promise-timeout'

export const getConfig = () => {
  return timeout(
    new Promise((resolve, reject) => {
      window.ipc.on('config-response', (event, arg) => {
        if (arg instanceof Error) {
          reject(arg)
        } else {
          resolve(arg)
        }
      })

      window.ipc.send('config-request')
    }),
    1000
  )
}

export const openURL = url => {
  window.ipc.send('url-request', url)
}
