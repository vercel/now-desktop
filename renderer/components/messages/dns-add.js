// Components
import Message from './message';

export default class DnsAdd extends Message {
  render() {
    const { event } = this.props;
    const { value } = event.payload;
    const v = value.slice(0, 50);

    return (
      <p>
        {this.getDisplayName()}
        added a DNS record for <b>{event.payload.domain}</b>:{' '}
        <code>
          {event.payload.id || ''}
          : {event.payload.name} {event.payload.type}{' '}
          {v + (v.length < value.length ? '…' : '')}
        </code>
      </p>
    );
  }
}
