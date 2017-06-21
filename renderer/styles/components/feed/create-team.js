export default `
  li {
    height: 23px;
    width: 23px;
    border-radius: 100%;
    box-sizing: border-box;
    border: 1px solid #E8E8E8;
    position: relative;
    transition: border .2s;
    flex-shrink: 0;
  }

  li.scale {
    transition: border .2s, transform 0.6s;
    transform: scale(0);
  }

  li.scaled {
    transform: scale(1);
  }

  li:hover {
    border-color: #4e4e4e;
  }

  li i {
    display: block;
    transition: all .2s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
  }

  li i:before {
    content: '';
    display: block;
    background: #999999;
  }

  li:hover i:before {
    background: #4e4e4e;
  }

  li i:first-child:before {
    height: 9px;
    width: 1px;
  }

  li i:last-child:before {
    width: 9px;
    height: 1px;
  }
`
