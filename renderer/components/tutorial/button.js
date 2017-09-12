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

    const options = {
      href: '#',
      onClick: this.clicked,
      className: classes.join(' ')
    }

    if (this.props.title) {
      options.title = this.props.title
      options.style = { cursor: 'help' }
    }

    return (
      <a {...options}>
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
  title: string
}

export default Button
