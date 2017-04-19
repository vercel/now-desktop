// Packages
import React from 'react'

// Components
import Deploy from '../vectors/deploy'

const Title = ({ children, light }) => (
  <aside className={light && 'light'}>
    <h1>{children}</h1>

    {light &&
      <span className="deploy">
        <Deploy />
      </span>}

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
        user-select: none;
        cursor: default;
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
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
      }

      .light h1 {
        color: #000;
        font-size: 14px;
      }

      .light .deploy {
        position: absolute;
        height: 37px;
        width: 42px;
        right: 0;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        opacity: .6;
      }

      .light .deploy:hover {
        opacity: 1;
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
