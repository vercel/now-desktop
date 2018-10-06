// Components
import Message from './message'

export default class TeamMemberRoleUpdate extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        updated <b>{event.payload.updatedUser.username}</b>
        {`'`}s role from <b>{event.payload.previousRole}</b>{' '}
        to <b>{event.payload.role}</b>
      </p>
    )
  }
}
