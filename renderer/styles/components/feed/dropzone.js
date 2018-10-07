import css from 'styled-jsx/css'

export default css`
  aside {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: transparent;
    z-index: 20000;
    overflow: hidden;
  }

  section {
    display: block;
    height: 303px;
    background: #fff;
    padding: 20px;
    box-sizing: border-box;
    width: 100%;
    margin-top: 36px;
    pointer-events: none;
  }

  section.dark {
    background: #121212;
    color: #fff;
  }

  span {
    display: block;
    border: 1px dashed #d0d0d0;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border-radius: 5px;
  }

  span.dark {
    border: 1px dashed #444;
  }

  h1 {
    font-size: 16px;
    margin-bottom: 7px;
  }

  p {
    text-align: center;
    font-size: 12px;
    width: 250px;
    line-height: 20px;
    margin-top: -2px;
  }

  b {
    font-weight: 700;
  }
`
