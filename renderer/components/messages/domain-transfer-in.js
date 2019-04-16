import Message from './message';

export default class DomainTransferIn extends Message {
  render() {
    const { payload } = this.props.event;
    return (
      <p>
        {this.getDisplayName()}
        initiated domain transfer for <b>{payload.name}</b>{' '}
        {payload.price ? `($${payload.price})` : ''}
      </p>
    );
  }
}
