import css from 'styled-jsx/css'

export default css`
  section {
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

  section.dark {
    background: #2c2c2c;
    background: linear-gradient(
      180deg,
      rgba(64, 64, 64, 1) 0%,
      rgba(51, 51, 51, 1) 100%
    );
    color: #fff;
  }

  section .icon {
    height: inherit;
    width: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }

  section .icon.clickable {
    opacity: 0.5;
    transition: opacity 0.2s ease;
  }

  section .icon.clickable:hover {
    opacity: 1;
  }
`
