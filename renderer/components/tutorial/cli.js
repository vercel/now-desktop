// Packages
import React from 'react'
import { bool, func } from 'prop-types'

// Styles
import binaryStyles from '../../styles/components/tutorial/cli'

const Binary = props => (
  <div className="cli-wrapper">
    <p className="has-tiny-spacing">
      <input
        id="cli"
        type="checkbox"
        checked={props.checked}
        className="black-checkbox"
        onChange={props.onCheckboxChange}
      />
      <label htmlFor="cli">
        {' '}
        Install command-line <code>`now`</code> client and{' '}
      </label>
      <strong>keep it up-to-date</strong>
    </p>

    <p className="permission">
      This might need additional administrator permissions.
    </p>
    <style jsx>{binaryStyles}</style>
  </div>
)

Binary.propTypes = {
  checked: bool,
  onCheckboxChange: func
}

export default Binary
