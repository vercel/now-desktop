// Packages
import React from 'react'

const WindowTitle = ({ children, light }) => (
  <aside className={light && 'light'}>
    <h1>{children}</h1>

    <style jsx>
      {`
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

      .light {
        border-bottom: 1px solid #D6D6D6;
        background: #fff;
        -webkit-app-region: drag;
        position: relative;
      }

      .light h1 {
        color: #000;
        font-size: 14px;
      }
    `}
    </style>
  </aside>
)

export default WindowTitle
