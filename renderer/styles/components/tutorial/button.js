export default `
  a {
    font-weight: 700;
    text-transform: uppercase;
    background: #000;
    text-align: center;
    text-decoration: none;
    color: #fff;
    font-size: 12px;
    padding: 9px 28px;
    transition: color .2s ease, background .2s ease;
    cursor: pointer;
    display: inline-block;
    line-height: normal;
    -webkit-app-region: no-drag;
    border: 2px solid #000;
    margin-top: 20px;
  }

  a:hover {
    background: transparent;
    color: #000;
  }

  a.disabled {
    background: transparent;
    cursor: default;
    color: #CCCCCC;
    border-color: currentColor;
  }
`
