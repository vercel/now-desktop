export default `
  aside {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    display: flex;
    width: 100%;
  }

  span {
    display: block;
    width: 36px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: .5;
    flex-shrink: 0;
    transition: opacity .2s ease;
  }

  span:hover {
    opacity: 1;
  }

  input {
    font-size: 13px;
    color: #000;
    border: 0;
    display: flex;
    border: 0;
    padding: 0;
    flex-shrink: 1;
    width: 100%;
  }

  input:focus {
    outline: none;
  }

  div {
    width: 100%;
    display: flex;
    justify-content: space-between;
    background: #fff;
    visibility: hidden;
    opacity: 0;
    transition: opacity .2s ease;
  }

  b {
    height: inherit;
    width: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    opacity: .5;
    transition: opacity .2s ease;
  }

  b:hover {
    opacity: 1;
  }

  .visible {
    z-index: 2000;
  }

  .visible div {
    opacity: 1;
  }

  .visible span {
    opacity: 1;
    cursor: default;
  }
`
