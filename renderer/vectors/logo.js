// Packages
import React from 'react';
import PropTypes from 'prop-types';

const Logo = ({ darkMode }) => (
  <svg
    width="43"
    height="40"
    viewBox="0 0 43 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g stroke={darkMode ? 'white' : 'black'} fill="none" fillRule="evenodd">
      <path
        strokeWidth="2.1875"
        d="M21.331521 3.05101328L40.663042 37.9972047H2z"
      />
      <path
        d="M38.9255319 37.5512821L20.6702128 4.34615385M39.7553191 37.5512821L21.5 4.34615385M38.0957446 37.5512821L20.6702128 5.24358974M37.2659575 37.5512821L20.6702128 6.14102564M19.8404255 6.14102564L38.0957446 37.5512821M36.4361702 37.5512821L19.8404255 7.03846154M33.1170213 30.3717948l-6.6382979-11.6666666"
        strokeWidth="1.94444444"
      />
    </g>
  </svg>
);

Logo.propTypes = {
  darkMode: PropTypes.bool
};

export default Logo;
