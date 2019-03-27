import { timeout } from 'promise-timeout'

export default () =>
  timeout(
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
