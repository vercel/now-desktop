// Components
import Message from './message';

export default class CertAutoRenew extends Message {
  render() {
    const { event } = this.props;

    return (
      <p>
        Certificate for <b>{event.payload.cn}</b> was automatically renewed
      </p>
    );
  }
}
