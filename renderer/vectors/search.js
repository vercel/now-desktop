// Packages
import React from 'react'
import { bool } from 'prop-types'

const Search = ({ darkBg = false }) => (
  <svg width="15" height="15" viewBox="0 0 13 13">
    <path
      d="M8.87147 8.1643659l3.24985 3.2498477-.70711.7071067-3.24984-3.2498476C7.30243 9.5768174 6.20064 10 5 10c-2.76142 0-5-2.2385763-5-5s2.23858-5 5-5 5 2.2385763 5 5c0 1.2006351-.42318 2.3024306-1.12853 3.1643659zM5 9c2.20914 0 4-1.790861 4-4S7.20914 1 5 1 1 2.790861 1 5s1.79086 4 4 4z"
      fill={darkBg ? '#999' : '#4e4e4e'}
      fillRule="nonzero"
    />
  </svg>
)

Search.propTypes = {
  darkBg: bool
}

export default Search
