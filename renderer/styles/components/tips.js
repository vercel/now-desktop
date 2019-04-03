import css from 'styled-jsx/css';

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
    filter: grayscale(1);
  }

  .tip.dark {
    background: #2c2c2c;
    background: linear-gradient(
      180deg,
      rgba(64, 64, 64, 1) 0%,
      rgba(51, 51, 51, 1) 100%
    );
    color: #999;
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
`;
