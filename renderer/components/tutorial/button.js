// Packages
import { PureComponent } from 'react';
import { func, bool, string } from 'prop-types';

// Styles
import styles from '../../styles/components/tutorial/button';

class Button extends PureComponent {
  clicked = event => {
    event.preventDefault();

    if (this.props.disabled || !this.props.onClick) {
      return;
    }

    this.props.onClick(event);
  };

  render() {
    const { disabled, title, className } = this.props;
    const classes = className ? className.split(' ') : [];

    if (disabled) {
      classes.push('disabled');
    }

    const options = {
      href: '#',
      onClick: this.clicked,
      className: classes.join(' ')
    };

    if (title) {
      options.title = title;
      options.style = { cursor: 'help' };
    }

    return (
      <a {...options}>
        {this.props.children}
        <style jsx>{styles}</style>
      </a>
    );
  }
}

Button.propTypes = {
  onClick: func,
  disabled: bool,
  children: string,
  title: string,
  className: string
};

export default Button;
