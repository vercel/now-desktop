// Packages
import React from 'react';
import PropTypes from 'prop-types';

const Back = ({ darkMode }) => (
  <svg
    width="6"
    height="10"
    viewBox="0 0 6 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.00003 9L1 4.99997"
      stroke={darkMode ? '#ccc' : '#444'}
      strokeLinecap="round"
    />
    <path
      d="M5.00003 1L1 5.00003"
      stroke={darkMode ? '#ccc' : '#444'}
      strokeLinecap="round"
    />
  </svg>
);

Back.propTypes = {
  darkMode: PropTypes.bool
};

export default Back;
