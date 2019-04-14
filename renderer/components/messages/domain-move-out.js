import Message from './message';

export default class DomainMoveOut extends Message {
  render() {
    const { payload } = this.props.event;
    return (
      <p>
        {this.getDisplayName()}
        moved domain <b>{payload.name}</b>
        {payload.destinationName ? ` to ${payload.destinationName}` : ` out`}
      </p>
    );
  }
}
