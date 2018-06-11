import css from 'styled-jsx/css'

export default css`
  .tip {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    font-size: 12px;
    align-items: center;
    display: flex;
    justify-content: space-between;
    height: 35px;
  }

  .tip .icon {
    height: inherit;
    width: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }

  .tip .icon.clickable {
    opacity: 0.5;
    transition: opacity 0.2s ease;
  }

  .tip .icon.clickable:hover {
    opacity: 1;
  }
`
