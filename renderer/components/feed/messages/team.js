import Message from './message';

export default class Team extends Message {
  render() {
    const { event, active } = this.props;
    const teamSlug = event.payload.slug;

    if (teamSlug === active.slug) {
      return (
        <p>
          {this.getDisplayName()}
          created <b>this team</b>
        </p>
      );
    }

    return (
      <p>
        {this.getDisplayName()}
        created the team <b>{event.payload.slug}</b>
      </p>
    );
  }
}
