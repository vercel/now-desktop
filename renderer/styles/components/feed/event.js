import css from 'styled-jsx/css'

export const localStyles = css`
  figure {
    margin: 0;
    display: flex;
    justify-content: space-between;
  }

  figure:hover {
    background: #f5f5f5;
  }

  figure figcaption {
    border-top: 1px solid #f5f5f5;
    padding: 10px 10px 10px 0;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    flex-shrink: 1;
    word-break: break-word;
    flex-grow: 1;
  }

  figure:last-child figcaption {
    padding-bottom: 10px;
  }

  figure:last-child figcaption {
    border-bottom: 0;
  }

  figure figcaption span {
    font-size: 10px;
    color: #9b9b9b;
    flex-shrink: 0;
  }
`

export const globalStyles = css`
  h1 + .event figcaption {
    border-top: 0 !important;
  }

  .event p {
    font-size: 12px;
    margin: 0;
    line-height: 17px;
    display: block;
    color: #666;
    padding-right: 10px;
    flex-shrink: 1;
  }

  .event p b {
    font-weight: normal;
    color: #000;
  }

  .event p code {
    font-family: Menlo, Monaco, Lucida Console, Liberation Mono, serif;
    background: #f5f5f5;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 12px;
    margin: 5px 0;
    display: block;
  }

  .event:hover p code {
    background: #e8e8e8;
  }

  .event:hover + .event figcaption {
    border-top-color: transparent;
  }

  .event mark {
    background: #ffff21;
  }
`
