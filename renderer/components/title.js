// Packages
import React from 'react';

const WindowTitle = () => (
  <aside>
    <h1>Welcome to Now</h1>

    <style jsx>
      {
        `
      aside {
        height: 37px;
        display: flex;
        position: fixed;
        justify-content: center;
        align-items: center;
        top: 0;
        left: 0;
        right: 0;
        background: #000;
        z-index: 5;
      }

      h1 {
        margin: 0;
        color: #9B9B9B;
        font-size: 12px;
        letter-spacing: 0.02em;
        font-weight: 400
      }
    `
      }
    </style>
  </aside>
);

export default WindowTitle;
