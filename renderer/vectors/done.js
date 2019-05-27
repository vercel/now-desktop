// Packages
import React from 'react';
import PropTypes from 'prop-types';

const Done = ({ color }) => (
  <svg
    width="12"
    height="9"
    viewBox="0 0 12 9"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g
      stroke={color || '#067DF7'}
      strokeWidth="2"
      fill="none"
      fillRule="evenodd"
      strokeLinecap="square"
    >
      <path d="M1.5 4.5l2.82842712 2.82842712M10.156854 1.5L4.49999975 7.15685425" />
    </g>
  </svg>
);

Done.propTypes = {
  color: PropTypes.string
};

export default Done;
