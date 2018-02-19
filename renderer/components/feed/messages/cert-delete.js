// Components
import Message from './message'

export default class CertDelete extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        deleted a certificate for <b>{event.payload.cn}</b>
      </p>
    )
  }
}
