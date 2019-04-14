// Components
import Message from './message';

export default class CertDelete extends Message {
  render() {
    const { event } = this.props;
    const { recordId } = event.payload;

    return (
      <p>
        {this.getDisplayName()}
        deleted certificate <b>{recordId}</b>
      </p>
    );
  }
}
