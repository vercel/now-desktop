// Components
import Message from './message'

export default class DomainDelete extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        removed domain <b>{event.payload.name}</b>
      </p>
    )
  }
}
