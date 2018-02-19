// Components
import Message from './message'

export default class TeamMemberRollUpdate extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        updated <b>{event.payload.updatedUser.username}</b>
        {`'`}s roll from <b>{event.payload.previousRoll}</b>
        to <b>{event.payload.roll}</b>
      </p>
    )
  }
}
