// Components
import Message from './message';

export default class AliasDelete extends Message {
  render() {
    const { event } = this.props;

    return (
      <p>
        {this.getDisplayName()}
        removed alias <b>{event.payload.alias}</b>
      </p>
    );
  }
}
