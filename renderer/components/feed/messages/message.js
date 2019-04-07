import { PureComponent } from 'react';
import { object } from 'prop-types';

class Message extends PureComponent {
  getDisplayName() {
    const { event } = this.props;

    if (event.user.username) {
      return [<b key="username">{event.user.username}</b>, ' '];
    }

    return [<b key="username">{event.user.email}</b>, ' '];
  }
}

Message.propTypes = {
  event: object,
  user: object,
  team: object
};

export default Message;
