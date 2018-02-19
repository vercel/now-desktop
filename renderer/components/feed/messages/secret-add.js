// Components
import Message from './message'

export default class SecretAdd extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        added secret{' '}
        <b>{event.payload.name ? event.payload.name : event.payload.uid}</b>
      </p>
    )
  }
}
