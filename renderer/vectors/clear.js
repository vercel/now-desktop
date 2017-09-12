// Packages
import React from 'react'
import { string, func } from 'prop-types'

const Clear = ({ color, onClick }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" onClick={onClick}>
    <g
      transform="translate(1 1)"
      strokeWidth=".8"
      fill="none"
      fillRule="evenodd"
    >
      <circle stroke={color} cx="8" cy="8" r="8" />
      <g stroke={color} strokeLinecap="square">
        <path d="M6 6l4.5254834 4.5254834M10.525484 6l-4.5254834 4.5254834" />
      </g>
    </g>
  </svg>
)

Clear.propTypes = {
  color: string,
  onClick: func
}

export default Clear
