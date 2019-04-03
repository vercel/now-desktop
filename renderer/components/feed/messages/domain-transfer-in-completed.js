import Message from './message';

export default class DomainTransferInCompleted extends Message {
  render() {
    const { payload } = this.props.event;
    return (
      <p>
        completed domain <b>{payload.name}</b> transfer
      </p>
    );
  }
}
