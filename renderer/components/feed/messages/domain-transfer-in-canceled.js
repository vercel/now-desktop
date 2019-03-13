import Message from './message'

export default class DomainTransferInCanceled extends Message {
  render() {
    const { payload } = this.props.event
    return (
      <p>
        canceled domain <b>{payload.name}</b> transfer
      </p>
    )
  }
}
