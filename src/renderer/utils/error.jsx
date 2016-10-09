// Packages
import {remote} from 'electron'

export default (detail, trace) => {
  const current = remote.getCurrentWindow()
  const handler = remote.getGlobal('errorHandler')

  if (!trace) {
    trace = null
  }

  handler(detail, trace, current)
}
