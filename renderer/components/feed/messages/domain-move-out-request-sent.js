import Message from './message'

export default class DomainMoveOutRequestSent extends Message {
  render() {
    const { payload } = this.props.event
    return (
      <p>
        {this.getDisplayName()}
        sent a move domain <b>{payload.name}</b> request{payload.destinationName
          ? ` to ${payload.destinationName}`
          : ''}
      </p>
    )
  }
}
