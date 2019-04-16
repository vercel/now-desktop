// Components
import Message from './message';

export default class Domain extends Message {
  render() {
    const { event } = this.props;

    return (
      <p>
        {this.getDisplayName()}
        added domain <b>{event.payload.name}</b>
      </p>
    );
  }
}
