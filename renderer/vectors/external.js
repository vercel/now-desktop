// Packages
import React from 'react';
import PropTypes from 'prop-types';

const External = ({ darkMode, color: color_ }) => {
  const color = color_ ? color_ : darkMode ? 'white' : 'black';

  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.30005 6.8L11.3 1.5" stroke={color} strokeLinecap="square" />
      <path d="M12 1V5M8 1H12H8Z" stroke={color} strokeLinecap="square" />
      <path
        d="M10 7.5V10C10 11.1046 9.10457 12 8 12H3C1.89543 12 1 11.1046 1 10V5C1 3.9 1.9 3 3 3H5.5"
        stroke={color}
      />
    </svg>
  );
};

External.propTypes = {
  darkMode: PropTypes.bool,
  color: PropTypes.string
};

export default External;
