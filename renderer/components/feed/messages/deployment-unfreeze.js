// Components
import Message from './message'

export default class DeploymentUnfreeze extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        The deployment <b>{event.payload.url}</b> was unfrozen
      </p>
    )
  }
}
