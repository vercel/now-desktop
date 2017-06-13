export const pageStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Helvetica Neue, sans-serif;
    -webkit-font-smoothing: antialiased;
    margin: 0;
    overflow: hidden;
  }
`

export const feedStyles = `
  main, div {
    display: flex;
    flex-direction: column;
  }

  main {
    height: 100vh;
  }

  div {
    flex-shrink: 1;
    position: relative;
  }

  section {
    overflow-y: auto;
    overflow-x: hidden;
    background: #fff;
    user-select: none;
    cursor: default;
    flex-shrink: 1;
    position: relative;
  }

  /*
    This is required because the element always needs
    to be at least as high as the remaining space, flex
    will shrink it down then
  */

  section {
    height: 100vh;
  }
`

export const headingStyles = `
  h1 {
    background: #F5F5F5;
    font-size: 10px;
    height: 23px;
    line-height: 23px;
    padding: 0 10px;
    color: #000;
    margin: 0;
    position: sticky;
    top: 0;
    text-transform: uppercase;
    font-weight: 200;
    border-bottom: 1px solid #fff;
    border-top: 1px solid #fff;
  }

  h1:first-child {
    border-top: 0;
  }
`

export const loaderStyles = `
  aside {
    font-size: 12px;
    color: #666666;
    text-align: center;
    background: #F5F5F5;
    border-top: 1px solid #fff;
    padding: 12px 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  img {
    height: 17px;
    margin-right: 8px;
  }
`
