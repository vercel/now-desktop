import css from 'styled-jsx/css'

export default css`
  div {
    display: flex;
    width: 100%;
    height: 100%;
    position: absolute;
    background: #f5f5f5;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  div.dark {
    color: #999;
    background: #1f1f1f;
  }

  h1 {
    font-size: 16px;
    margin: 10px 0 0 0;
  }

  p {
    text-align: center;
    font-size: 12px;
    width: 250px;
    line-height: 20px;
    margin: 5px;
  }

  b {
    font-weight: 600;
  }
`
