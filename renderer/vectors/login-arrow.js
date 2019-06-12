// Packages
import React from 'react';
import PropTypes from 'prop-types';

const LoginArrow = ({ darkBg }) => (
  <svg
    width="15"
    height="14"
    viewBox="0 0 15 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.45703 13.4336L14.8828 7.00781L8.45703 0.591797L6.73828 2.31055L10.2539 5.80664H0.126953V8.21875H10.2539L6.73828 11.7051L8.45703 13.4336Z"
      fill={darkBg ? 'white' : 'black'}
    />
  </svg>
);

LoginArrow.propTypes = {
  darkBg: PropTypes.bool
};

export default LoginArrow;
