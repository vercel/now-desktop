// Packages
import React from 'react'

const CloseWindow = () => (
  <svg height="10px" width="10px" viewBox="0 0 10 10" version="1.1">
    <g fill="none" fillRule="evenodd">
      <g
        stroke="currentColor"
        transform="translate(.25 .25)"
        strokeLinecap="square"
      >
        <path d="M0.5,0.5 L9,9" />
        <path d="M0.5,0.5 L9,9" transform="matrix(-1 0 0 1 9.5 0)" />
      </g>
      <polygon points="0 0 10 0 10 10 0 10" />
    </g>
  </svg>
)

export default CloseWindow
