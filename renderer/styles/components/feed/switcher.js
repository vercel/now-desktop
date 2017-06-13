export default `
  ul {
    margin: 0;
    list-style: none;
    display: flex;
    flex-direction: row;
    flex-shrink: 1;
    flex-grow: 1;
    padding: 0 0 0 10px;
    height: inherit;
    align-items: center;
    overflow-x: auto;
    overflow-y: hidden;
    position: relative;
  }

  ul:after {
    content: '';
    width: 23px;
    display: block;
    height: inherit;
    flex-shrink: 0;
  }

  ul::-webkit-scrollbar {
    display: none;
  }

  ul .shadow {
    display: block;
    height: 40px;
    width: 40px;
    background: linear-gradient(to right, transparent, #fff);
    position: fixed;
    left: calc(290px - 40px);
    bottom: 0;
  }

  li {
    height: 23px;
    width: 23px;
    border-radius: 100%;
    box-sizing: border-box;
    border: 1px solid #E8E8E8;
    position: relative;
    transition: border .2s, transform 0.6s;
    flex-shrink: 0;
    transform: scale(0);
  }

  li.shown {
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

  aside {
    height: 40px;
    bottom: 0;
    left: 0;
    right: 0;
    flex-shrink: 0;
    flex-grow: 0;
    border-top: 1px solid #D6D6D6;
    display: flex;
    background: #fff;
    user-select: none;
    justify-content: space-between;
  }

  aside .toggle-menu {
    display: block;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex-shrink: 0;
  }

  aside .toggle-menu i {
    width: 18px;
    height: 1px;
    background: #4e4e4e;
    display: block;
    opacity: .5;
    transition: opacity .2s ease;
  }

  aside .toggle-menu i:nth-child(2) {
    margin: 3px 0;
  }

  aside .toggle-menu:hover i {
    opacity: 1;
  }

  .offline {
    margin: 0;
    line-height: 40px;
    padding-left: 10px;
    font-size: 12px;
    color: #4e4e4e;
  }
`
