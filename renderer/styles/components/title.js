export default `
  aside {
    height: 38px;
    display: flex;
    position: fixed;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    right: 0;
    background: #fff;
    z-index: 5;
    user-select: none;
    cursor: default;
  }

  h1 {
    margin: 0;
    color: #000000;
    font-size: 12px;
    letter-spacing: 0.02em;
    font-weight: 500;
  }

  .light {
    height: 35px;
    border-bottom: 1px solid #D6D6D6;
    background: #fff;
    position: relative;
    overflow: hidden;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    flex-shrink: 0;
  }

  .light h1 {
    color: #000;
    font-size: 13px;
    font-weight: 600;
  }

  .light .filter,
  .light .deploy {
    position: absolute;
    height: 36px;
    width: 36px;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: .5;
    transition: opacity .2s ease;
  }

  .light .filter:hover,
  .light .deploy:hover {
    opacity: 1;
  }

  .light .deploy {
    right: 0;
  }

  .light .deploy.hidden {
    opacity: 0;
  }

  .light .filter {
    right: 36px;
  }

  .windows {
    border-radius: 0;
  }

  section {
    opacity: 0;
    transition: opacity .8s ease;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    font-size: 12px;
    align-items: center;
    display: flex;
    padding-left: 17px;
    pointer-events: none;
  }

  section p {
    margin-left: 12px;
  }

  .scope-updated section {
    opacity: 1;
  }

  div {
    transition: opacity .5s ease;
  }

  .scope-updated div {
    opacity: 0;
  }
`
