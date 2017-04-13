// Packages
import { remote } from 'electron'

export default (detail, trace) => {
  const current = remote.getCurrentWindow()
  const { error } = remote.require('./dialogs')

  if (!trace) {
    trace = null
  }

  error(detail, trace, current)
}
