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

  aside.filter-visible {
    height: auto;
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
    display: block;
  }

  .light h1 {
    color: #000;
    font-size: 13px;
    font-weight: 600;
  }

  .light .toggle-filter,
  .light .deploy {
    position: absolute;
    height: 36px;
    width: 36px;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: opacity .2s ease;
  }

  .light .toggle-filter {
    opacity: 0.35;
    right: 36px;
  }

  .light .toggle-filter:hover,
  .light .deploy:hover,
  .light.filter-visible .toggle-filter {
    opacity: 1;
  }

  .light .deploy {
    opacity: .5;
    right: 0;
  }

  .light .deploy.hidden {
    opacity: 0;
  }

  .windows {
    border-radius: 0;
  }

  .update-message {
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
    height: 35px;
  }

  .update-message p {
    margin-left: 12px;
  }

  .scope-updated .update-message {
    opacity: 1;
  }

  div {
    transition: opacity .5s ease;
  }

  .light div {
    height: 36px;
    width: 100vw;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .scope-updated div {
    opacity: 0;
  }

  .filter {
    display: none;
    justify-content: center;
    padding-bottom: 16px;
    padding-top: 5px;
  }

  .filter a {
    color: #999999;
    text-decoration: none;
    font-size: 11px;
    display: block;
    flex: 1;
    text-align: center;
    padding: 3px 0;
    cursor: default;
  }

  .filter a.active {
    color: #000;
  }

  .filter a:nth-child(1) {
    border-right: 1px solid #EAEAEA;
  }

  .filter a:nth-child(3) {
    border-left: 1px solid #EAEAEA;
  }

  .filter nav {
    border: 1px solid #EAEAEA;
    display: flex;
    border-radius: 3px;
    width: 190px;
    justify-content: space-between;
  }

  .filter-visible .filter {
    display: flex;
  }
`
