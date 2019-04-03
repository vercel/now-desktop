import { PureComponent } from 'react';
import { number, bool } from 'prop-types';
import styles from '../../styles/components/feed/create-team';
import { openURL } from '../../utils/ipc';

class CreateTeam extends PureComponent {
  state = {
    scaled: false
  };

  open(event) {
    event.preventDefault();
    openURL('https://zeit.co/teams/create');
  }

  componentDidMount() {
    this.checkScale(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.checkScale(nextProps);
  }

  checkScale(props) {
    const { delay } = props;

    if (this.state.scaled || delay === 0) {
      return;
    }

    this.prepareScale(delay);
  }

  prepareScale(delay) {
    const when = 100 + 100 * delay;

    setTimeout(() => {
      this.setState({
        scaled: true
      });
    }, when);
  }

  render() {
    const classes = [];

    if (this.state.scaled) {
      classes.push('scaled');
    }

    if (this.props.darkBg) {
      classes.push('dark');
    }

    return (
      <a
        onClick={this.open}
        title="Create a Team"
        className={classes.join(' ')}
      >
        <i />
        <i />

        <style jsx>{styles}</style>
      </a>
    );
  }
}

CreateTeam.propTypes = {
  delay: number,
  darkBg: bool
};

export default CreateTeam;
