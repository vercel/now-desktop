import css from 'styled-jsx/css'

export default css`
  a {
    height: 23px;
    width: 23px;
    border-radius: 100%;
    box-sizing: border-box;
    border: 1px solid #e8e8e8;
    position: relative;
    flex-shrink: 0;
    margin: 0 20px 0 10px;
    display: block;
    transition: border 0.2s, transform 0.6s;
    transform: scale(0);
  }

  a.scaled {
    transform: scale(1);
  }

  a:hover {
    border-color: #4e4e4e;
  }

  a i {
    display: block;
    transition: all 0.2s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
  }

  a i:before {
    content: '';
    display: block;
    background: #999999;
  }

  a:hover i:before {
    background: #4e4e4e;
  }

  a i:first-child:before {
    height: 9px;
    width: 1px;
  }

  a i:last-child:before {
    width: 9px;
    height: 1px;
  }
`
