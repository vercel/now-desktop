// Components
import Message from './message'

export default class TeamSlugUpdate extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        updated team url to <b>{event.payload.slug}</b>
      </p>
    )
  }
}
