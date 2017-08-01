export const listStyle = `
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

export const itemStyle = `
  li {
    width: 23px;
    height: 23px;
    border-radius: 100%;
    margin-right: 10px;
    opacity: .3;
    transition-duraction: 300ms;
  }

  li:last-child {
    margin-right: 0;
  }

  li.active {
    opacity: 1;
    cursor: default;
  }
`

export const helperStyle = `
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
    animation: scale .4s forwards;
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

export const wrapStyle = `
  aside {
    height: 40px;
    bottom: 0;
    left: 0;
    right: 0;
    flex-shrink: 0;
    flex-grow: 0;
    border-top: 1px solid #D6D6D6;
    display: flex;
    background: #fff;
    user-select: none;
    justify-content: space-between;
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

  aside .toggle-menu i {
    width: 18px;
    height: 1px;
    background: #4e4e4e;
    display: block;
    opacity: .5;
    transition: opacity .2s ease;
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
    font-size: 13px;
    display: block;
    user-select: none;
  }

  .update-failed a {
    font-weight: 700;
  }

  .update-failed + aside {
    border-top: 0;
  }
`
