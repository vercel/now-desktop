// Components
import Message from './message'

export default class Username extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        set username to <b>{event.payload.username}</b>
      </p>
    )
  }
}
