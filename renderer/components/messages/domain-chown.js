// Components
import Message from './message';

export default class DomainChown extends Message {
  render() {
    const { event } = this.props;

    return (
      <p>
        {this.getDisplayName()}
        changed the ownership of domain <b>{event.payload.name}</b>
        {event.payload.oldTeam
          ? ` from {event.payload.oldTeam.name}`
          : ''} to {event.payload.newTeam.name}
      </p>
    );
  }
}
