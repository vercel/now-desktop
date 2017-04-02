// Packages
import React from 'react';

const MaximizeWindow = () => (
  <svg height="10px" width="10px" viewBox="0 0 10 10" version="1.1">
    <defs>
      <polygon id="maximize-window-a" points="0 0 10 0 10 10 0 10" />
      <mask id="maximize-window-b" width="10" height="10" x="0" y="0">
        <use xlinkHref="#maximize-window-a" />
      </mask>
    </defs>
    <g fill="none" fillRule="evenodd">
      <polygon fill="none" points="0 0 10 0 10 10 0 10" />
      <use
        stroke="currentColor"
        strokeWidth="2"
        mask="url(#maximize-window-b)"
        xlinkHref="#maximize-window-a"
      />
    </g>
  </svg>
);

export default MaximizeWindow;
