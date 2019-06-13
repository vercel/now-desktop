import { PureComponent } from 'react';
import { object } from 'prop-types';

class Message extends PureComponent {
  getDisplayName() {
    const { event, user } = this.props;

    if (!event.user && event.userId === user.id) {
      event.user = user;
    }

    if (event.user && event.user.username) {
      return [<b key="username">{event.user.username}</b>, ' '];
    }

    if (event.user && event.user.slug) {
      return [<b key="username">{event.user.slug}</b>, ' '];
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
