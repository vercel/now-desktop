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
    height: 291px;
    background: #fff;
    padding: 10px;
    box-sizing: border-box;
    width: 100%;
    margin-top: 36px;
    pointer-events: none;
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
  }

  b {
    font-weight: normal;
    text-decoration: underline;
  }
`
