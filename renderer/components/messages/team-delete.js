// Components
import Message from './message';

export default class TeamDelete extends Message {
  render() {
    const { event } = this.props;

    return (
      <p>
        {this.getDisplayName()}
        deleted the team <b>{event.payload.slug}</b>
      </p>
    );
  }
}
