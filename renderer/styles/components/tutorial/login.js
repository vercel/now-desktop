export default `
  .login input {
    border: 0;
    outline: 0;
    padding: 0;
    background: transparent;
    color: #9B9B9B;
    height: 32px;
    line-height: 32px;
    text-align: left;
    transition: border, background, color .1s ease-in;
    max-width: 380px;
    z-index: 300;
    position: relative;
    font-family: inherit;
    font-size: inherit;
  }

  .login input:focus {
    color: #000;
  }

  .login a {
    margin-top: 30px;
  }

  .login {
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #EAEAEA;
    min-width: 300px;
    text-align: center;
    margin-top: 25px;
    transition: all 0.4s ease;
    cursor: text;
    -webkit-app-region: no-drag;
    font-size: 14px;
  }

  .login.focus {
    border-bottom-color: #067DF7;
  }

  .login.verifying {
    display: none;
  }

  .login.error {
    border-bottom-color: #ff286a;
    animation: shake 1s both;
  }

  .login.error input {
    color: #ff286a;
  }

  .login div {
    position: relative;
    display: inline-block;
  }

  .login span {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    color: #999;
    line-height: 35px;
    text-align: left;
    text-indent: 0px;
    font-family: inherit;
    font-size: inherit;
    margin-top: -2px;
    white-space: nowrap;
  }

  .login span.hidden {
    opacity: 0;
  }

  .login i {
    font-style: normal;
    visibility: hidden;
  }

  @keyframes shake {
    0%, 100% {
      transform: translate3d(0, 0, 0);
    }

    10%, 30%, 50%, 70%, 90% {
      transform: translate3d(-10px, 0, 0);
    }

    20%, 40%, 60%, 80% {
      transform: translate3d(10px, 0, 0);
    }
  }
`
