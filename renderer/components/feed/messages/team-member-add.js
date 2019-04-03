// Components
import Message from './message';

export default class TeamMemberAdd extends Message {
  render() {
    const { event } = this.props;
    const invitedUser = event.payload.invitedUser;

    const email = invitedUser && invitedUser.email;
    const username = invitedUser && invitedUser.username;
    const displayName = email || username;

    if (displayName) {
      return (
        <p>
          {this.getDisplayName()}
          invited user{email ? ' with email address' : ''} <b>{displayName}</b>
        </p>
      );
    }

    return (
      <p>
        {this.getDisplayName()}
        invited a new user
      </p>
    );
  }
}
