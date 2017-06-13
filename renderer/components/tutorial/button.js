// Packages
import React, { PureComponent } from 'react'
import { func, bool, string } from 'prop-types'

// Styles
import styles from '../../styles/button'

class Button extends PureComponent {
  clicked(event) {
    event.preventDefault()

    if (this.props.disabled || !this.props.onClick) {
      return
    }

    this.props.onClick(event)
  }

  render() {
    const classes = []

    if (this.props.disabled) {
      classes.push('disabled')
    }

    return (
      <a href="#" onClick={this.clicked.bind(this)} className={classes}>
        {this.props.children}
        <style jsx>{styles}</style>
      </a>
    )
  }
}

Button.propTypes = {
  onClick: func,
  disabled: bool,
  children: string
}

export default Button
