// Packages
import React from 'react'

const Title = ({ children, light }) => (
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
        position: relative;
        height: 40px;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
      }

      .light h1 {
        color: #000;
        font-size: 14px;
      }
    `}
    </style>
  </aside>
)

Title.propTypes = {
  children: React.PropTypes.element.isRequired,
  light: React.PropTypes.bool
}

export default Title
