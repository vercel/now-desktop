// Components
import Message from './message'

export default class AliasSystem extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        The alias <b>{event.payload.alias}</b> was assigned to{' '}
        <b>{event.payload.deploymentUrl}</b>
      </p>
    )
  }
}
