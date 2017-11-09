import css from 'styled-jsx/css'

export default css`
  div {
    flex-shrink: 0;
  }

  img {
    height: 23px;
    width: 23px;
    border-radius: 23px;
  }

  .scale {
    transform: scale(0);
    transition: all 0.6s;
  }

  .scaled {
    transform: scale(1);
  }

  .in-event {
    margin: 8px 10px 0 10px;
  }
`
