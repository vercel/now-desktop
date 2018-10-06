// Packages
import React from 'react'
import { string, bool } from 'prop-types'

const Filter = ({ background, darkBg = false }) => {
  const bgFill = darkBg ? '#3a3a3a' : '#FFF'
  const strokeFill = darkBg ? '#999' : '#000'

  const props = {
    width: '17px',
    height: '13px'
  }

  if (background) {
    props.height = '11px'
    props.width = '15px'

    props.style = {
      margin: '0 1px -1px 2px'
    }
  }

  return (
    <svg
      {...props}
      viewBox="0 0 17 13"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g
        id="2.5-Filters"
        stroke="none"
        strokeWidth={1}
        fill="none"
        fillRule="evenodd"
      >
        <g
          id="Now-Desktop"
          transform="translate(-408.000000, -110.000000)"
          stroke={strokeFill}
        >
          <g id="App" transform="translate(79.000000, 54.000000)">
            <g id="Filters-Icon" transform="translate(329.000000, 57.000000)">
              <path d="M16.5,8.5 L0.5,8.5" id="Line" strokeLinecap="square" />
              <path d="M16.5,2.5 L0.5,2.5" id="Line" strokeLinecap="square" />
              <circle id="Oval" fill={bgFill} cx="5.5" cy="2.5" r="2.5" />
              <circle id="Oval" fill={bgFill} cx="11.5" cy="8.5" r="2.5" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}

Filter.propTypes = {
  background: string,
  darkBg: bool
}

export default Filter
