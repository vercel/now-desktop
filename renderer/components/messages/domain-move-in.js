import Message from './message';

export default class DomainMoveIn extends Message {
  render() {
    const { payload } = this.props.event;
    return (
      <p>
        {this.getDisplayName()}
        moved in domain <b>{payload.name}</b>
        {payload.fromName ? ` from ${payload.fromName}` : ''}
      </p>
    );
  }
}
