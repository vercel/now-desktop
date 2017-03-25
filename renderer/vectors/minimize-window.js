// Packages
import React from 'react';

const MinimizeWindow = () => (
  <svg viewBox="0 0 10 10" version="1.1">
    <g fill="none" fillRule="evenodd">
      <polygon points="0 0 10 0 10 10 0 10" />
      <path stroke="currentColor" d="M9.5,5 L0.5,5" strokeLinecap="square" />
    </g>
    <g fill="none" fillRule="evenodd">
      <polygon points="0 0 10 0 10 10 0 10" />
      <rect width="10" height="1" y="4.5" fill="currentColor" />
    </g>
  </svg>
);

export default MinimizeWindow;
