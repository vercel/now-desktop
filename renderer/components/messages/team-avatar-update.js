// Components
import Message from './message';

export default class TeamAvatarUpdate extends Message {
  render() {
    return (
      <p>
        {this.getDisplayName()}
        updated the team{`'`}s avatar
      </p>
    );
  }
}
