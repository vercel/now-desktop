// Packages
import React from 'react';
import PropTypes from 'prop-types';

const Menu = ({ darkBg }) => (
  <svg width="2" height="12" viewBox="0 0 2 12">
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g
        transform="translate(-1151.000000, -341.000000)"
        className="dots-menu"
        fill={darkBg ? '#dddddd' : '#666666'}
      >
        <g transform="translate(270.000000, 327.000000)">
          <g
            id="More"
            transform="translate(882.000000, 20.000000) rotate(-270.000000) translate(-882.000000, -20.000000) translate(876.000000, 19.000000)"
          >
            <rect x="0" y="0" width="1.84615385" height="2" />
            <rect x="5.07692308" y="0" width="1.84615385" height="2" />
            <rect x="10.1538462" y="0" width="1.84615385" height="2" />
          </g>
        </g>
      </g>
    </g>
  </svg>
);

Menu.propTypes = {
  darkBg: PropTypes.bool
};

export default Menu;
