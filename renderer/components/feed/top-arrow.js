import { PureComponent } from 'react';
import { bool } from 'prop-types';
import Caret from '../../vectors/caret';
import styles from '../../styles/components/feed/top-arrow';

class TopArrow extends PureComponent {
  state = {
    left: 0
  };

  preventDefault(event) {
    event.preventDefault();
  }

  componentDidMount() {
    // Calculate top arrow position once in the beginning
    this.tryPosition();

    // And then every 500 milliseconds
    setInterval(() => {
      this.tryPosition();
    }, 500);
  }

  tryPosition() {
    // Handle positioing
  }

  position(tray, windowBounds) {
    const trayBounds = tray.getBounds();

    const trayCenter = trayBounds.x + trayBounds.width / 2;
    const windowLeft = windowBounds.x;

    const caretLeft = trayCenter - windowLeft - 28 / 2;

    this.setState({
      left: caretLeft
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.left === prevState.left) {
      return;
    }

    if (!this.remote) {
      return;
    }

    const currentWindow = this.remote.getCurrentWindow();
    const size = currentWindow.getSize();

    setTimeout(() => {
      size[1]++;
      currentWindow.setSize(...size, true);
    }, 100);

    setTimeout(() => {
      size[1]--;
      currentWindow.setSize(...size, true);
    }, 110);
  }

  render() {
    const style = {};

    if (this.state.left) {
      style.paddingLeft = this.state.left;
    }

    return (
      <span
        style={style}
        onDragOver={this.preventDefault}
        onDrop={this.preventDefault}
      >
        <Caret darkBg={this.props.darkBg} />

        <style jsx>{styles}</style>
      </span>
    );
  }
}

TopArrow.propTypes = {
  darkBg: bool
};

export default TopArrow;
