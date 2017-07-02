export const sliderStyle = `
  body {
    margin: 0;
    font-family: -apple-system,
      BlinkMacSystemFont,
      Segoe UI,
      Roboto,
      Oxygen,
      Helvetica Neue,
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -webkit-app-region: drag;
  }

  ::selection {
    background: #A7D8FF;
  }

  .slick-slider {
    position: relative;
    display: block;
    box-sizing: border-box;
    user-select: none;
    -webkit-touch-callout: none;
    touch-action: pan-y;
    -webkit-tap-highlight-color: transparent;
  }

  .slick-list {
    position: relative;
    display: block;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }

  .slick-list:focus {
    outline: none;
  }

  .slick-slider .slick-track, .slick-slider .slick-list {
    transform: translate3d(0, 0, 0);
  }

  .slick-track {
    position: relative;
    top: 0;
    left: 0;
    display: block;
  }

  .slick-track:before, .slick-track:after {
    display: table;
    content: '';
  }

  .slick-track:after {
    clear: both;
  }

  .slick-loading .slick-track {
    visibility: hidden;
  }

  .slick-slide {
    display: none;
    float: left;
    height: 100%;
    min-height: 1px;
  }

  [dir='rtl'] .slick-slide {
    float: right;
  }

  .slick-slide img {
    display: block;
  }

  .slick-slide.slick-loading img {
    display: none;
  }

  .slick-slide.dragging img {
    pointer-events: none;
  }

  .slick-initialized .slick-slide {
    display: block;
  }

  .slick-loading .slick-slide {
    visibility: hidden;
  }

  .slick-vertical .slick-slide {
    display: block;
    height: auto;
    border: 1px solid transparent;
  }

  .slick-arrow.slick-hidden {
    display: none;
  }

  .slick-initialized .slick-slide {
    height: 100vh;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .slick-arrow {
    height: 100vh !important;
    z-index: 4000;
    top: 0;
    position: fixed;
    width: 50px !important;
    display: flex !important;
    justify-content: center;
    align-items: center;
    background: linear-gradient(to left, #fff, transparent);
    opacity: 0;
    transition: opacity .3s ease;
    -webkit-app-region: no-drag;
  }

  .slick-arrow.slick-disabled {
    cursor: default;
  }

  .slick-arrow:not(.slick-disabled) {
    opacity: .2 !important;
  }

  .slick-arrow:not(.slick-disabled):hover {
    opacity: 1 !important;
  }

  .slick-arrow.slick-prev {
    left: 0;
    transform: rotate(180deg);
  }

  .slick-arrow.slick-next {
    right: 0;
  }

  .slick-dots {
    margin: 0;
    padding: 0;
    position: fixed;
    display: flex !important;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    justify-content: center;
    align-items: center;
    list-style: none;
    z-index: 100;
  }

  .slick-dots li {
    display: block;
    -webkit-app-region: no-drag;
    margin: 0 3px;
  }

  .slick-dots li button {
    display: block;
    height: 10px;
    width: 10px;
    background: #CCCCCC;
    border: 0;
    text-indent: -999px;
    border-radius: 100%;
    padding: 0;
    transition: background .4s;
  }

  .slick-dots li button:focus {
    outline: 0;
  }

  .slick-dots li button:hover, .slick-dots li.slick-active button {
    background: #000;
  }
`

export const wrapStyle = `
  main {
    color: #000;
    background: #fff;
    height: 100vh;
    width: 100vw;
  }
`

export const controlStyle = `
  .window-controls {
    display: flex;
    justify-content: flex-end;
    position: fixed;
    right: 0;
    top: 0;
    left: 0;
    height: 10px;
    padding: 10px;
    z-index: 5000; /* the slick arrow is at 4000 */
    background: transparent;
  }

  .window-controls span {
    opacity: .5;
    font-size: 0;
    display: block;
    -webkit-app-region: no-drag;
    margin-left: 10px;
  }

  .window-controls span:hover {
    opacity: 1;
  }
`
