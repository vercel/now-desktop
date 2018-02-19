// Components
import Message from './message'

export default class Deployment extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        deployed <b>{event.payload.name}</b> to <b>{event.payload.url}</b>
      </p>
    )
  }
}
