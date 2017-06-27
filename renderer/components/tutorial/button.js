// Packages
import React, { PureComponent } from 'react'
import { func, bool, string } from 'prop-types'

// Styles
import styles from '../../styles/components/tutorial/button'

class Button extends PureComponent {
  constructor(props) {
    super(props)
    this.clicked = this.clicked.bind(this)
  }

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

    if (this.props.space) {
      classes.push('has-space')
    }

    return (
      <a href="#" onClick={this.clicked} className={classes.join(' ')}>
        {this.props.children}
        <style jsx>{styles}</style>
      </a>
    )
  }
}

Button.propTypes = {
  onClick: func,
  disabled: bool,
  children: string,
  space: bool
}

export default Button
