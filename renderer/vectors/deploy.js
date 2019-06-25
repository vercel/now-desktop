// Packages
import React from 'react';
import PropTypes from 'prop-types';

const Deploy = ({ darkBg }) => (
  <svg
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.5601 8.05601L1.00006 8.05602"
      stroke={darkBg ? '#dddddd' : '#666666'}
      strokeLinecap="round"
    />
    <path
      d="M8.27991 15L8.27991 1"
      stroke={darkBg ? '#dddddd' : '#666666'}
      strokeLinecap="round"
    />
  </svg>
);

Deploy.propTypes = {
  darkBg: PropTypes.bool
};

export default Deploy;
