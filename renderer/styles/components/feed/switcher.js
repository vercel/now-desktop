import css from 'styled-jsx/css'

export const listStyle = css`
  ul {
    margin: 0;
    list-style: none;
    display: flex;
    flex-direction: row;
    padding: 0;
    height: inherit;
    align-items: center;
    position: relative;
  }
`

/*
  Do not user hidden overflow here, otherwise
  the images will be cut off at the bottom
  that's a renderer-bug in chromium
*/

export const itemStyle = css`
  li {
    width: 23px;
    height: 23px;
    border-radius: 100%;
    margin-right: 10px;
    opacity: 0.3;
    filter: grayscale(1);
    transition-duration: 300ms;
  }

  li:hover {
    filter: grayscale(0);
    opacity: 1;
  }

  li.dark {
    border: 1px solid #666;
  }

  li:last-child {
    margin-right: 0;
  }

  li.active {
    opacity: 1;
    cursor: default;
    filter: grayscale(0);
  }
`

export const helperStyle = css`
  .switcher-helper {
    position: relative;
    opacity: 1 !important;
    z-index: 1000;
    overflow: visible;
  }

  .switcher-helper div {
    position: absolute;
    top: 0;
    left: 0;
    animation: scale 0.4s forwards;
  }

  body.is-moving {
    cursor: move;
  }

  @keyframes scale {
    0% {
      transform: scale(1);
    }

    100% {
      transform: scale(1.15);
    }
  }
`

export const wrapStyle = css`
  aside {
    height: 40px;
    bottom: 0;
    left: 0;
    right: 0;
    flex-shrink: 0;
    flex-grow: 0;
    border-top: 1px solid #d6d6d6;
    display: flex;
    background: #fff;
    user-select: none;
    justify-content: space-between;
  }

  aside.dark {
    border-top: 1px solid #000;
    background: #2c2c2c;
  }

  aside .toggle-menu {
    display: block;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex-shrink: 0;
    z-index: 2000;
    background: #fff;
  }

  aside.dark .toggle-menu {
    background: #2c2c2c;
  }

  aside .toggle-menu i {
    width: 18px;
    height: 1px;
    background: #4e4e4e;
    display: block;
    opacity: 0.5;
    transition: opacity 0.2s ease;
  }

  aside.dark .toggle-menu i {
    background: #b3b3b3;
  }

  aside .toggle-menu i:nth-child(2) {
    margin: 3px 0;
  }

  aside .toggle-menu:hover i {
    opacity: 1;
  }

  .list-scroll {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .list-container {
    flex-shrink: 1;
    flex-grow: 1;
    display: flex;
    height: inherit;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding-left: 10px;
    position: relative;
  }

  .list-container::-webkit-scrollbar {
    display: none;
  }

  .shadow {
    display: block;
    height: 40px;
    width: 20px;
    background: linear-gradient(to right, transparent, #fff);
    position: fixed;
    left: calc(290px - 20px);
    bottom: 0;
    z-index: 2000;
  }

  .dark .shadow {
    background: linear-gradient(to right, transparent, #2c2c2c);
  }

  .offline {
    margin: 0;
    line-height: 40px;
    padding-left: 10px;
    font-size: 12px;
    color: #4e4e4e;
  }

  .update-failed {
    background: #ff586c;
    color: #fff;
    cursor: default;
    padding: 8px 10px;
    font-size: 12px;
    display: block;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .update-failed p {
    margin: 0;
  }

  .update-failed a {
    font-weight: 700;
  }

  .update-failed + aside {
    border-top: 0;
  }
`
