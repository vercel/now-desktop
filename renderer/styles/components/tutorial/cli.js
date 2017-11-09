import css from 'styled-jsx/css'

export default css`
  article {
    width: 415px;
    font-size: 14px;
    text-align: center;
    line-height: 22px;
  }

  article p {
    cursor: default;
  }

  code {
    background: #eaeaea;
    padding: 1px 7px;
    border-radius: 3px;
    font-weight: 600;
  }

  a {
    text-decoration: none;
    color: #067df7;
  }

  a:hover {
    border-bottom: 1px solid #067df7;
  }

  .progress {
    background: #ccc;
    height: 20px;
    width: 250px;
    overflow: hidden;
    margin: 40px auto 0 auto;
    border-radius: 3px;
  }

  .progress span {
    display: block;
    background: #000;
    height: inherit;
  }
`
