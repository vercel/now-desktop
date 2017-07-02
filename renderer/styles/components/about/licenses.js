export default `
  details {
    margin-bottom: 10px;
  }

  p {
    font-size: 13px;
    line-height: 19px;
  }

  summary {
    color: #707070;
    font-size: 12px;
    transition: color .2s ease;
    display: inline-block;
    cursor: default;
  }

  summary:focus {
    outline: none;
  }

  summary:hover {
    color: #000;
  }

  details[open] summary {
    color: #000;
  }
`
