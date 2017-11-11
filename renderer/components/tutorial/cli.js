// Packages
import React from 'react'
import { bool, func } from 'prop-types'

// Styles
import binaryStyles from '../../styles/components/tutorial/cli'

const Binary = props => (
  <div>
    <p className="has-tiny-spacing">
      <input
        type="checkbox"
        checked={props.checked}
        className="checkbox"
        onChange={props.onCheckboxChange}
      />Install command-line <code>`now`</code> client and{' '}
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
