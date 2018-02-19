// Components
import Message from './message'

export default class Plan extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        changed plan to <b>{event.payload.plan}</b>
      </p>
    )
  }
}
