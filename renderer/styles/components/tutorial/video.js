import css from 'styled-jsx/css'

export const coreStyles = css`
  figure {
    display: flex;
    flex-direction: column;
    margin: 0;
    height: 100%;
    width: 100%;
    justify-content: flex-end;
    align-items: center;
    padding-bottom: 50px;
  }

  figure:after {
    content: '';
    background: #eaeaea;
    height: 1px;
    width: 100%;
    display: block;
  }

  video {
    width: 500px;
  }
`

export const captionStyles = css`
  figcaption {
    text-align: center;
    margin-bottom: 20px;
    cursor: default;
  }

  h1 {
    font-size: 25px;
    font-weight: normal;
    margin: 10px 0 0 0;
  }

  h2 {
    font-size: 12px;
    color: #067df7;
    text-transform: uppercase;
    font-weight: normal;
    margin: 0;
    letter-spacing: 1px;
  }
`
