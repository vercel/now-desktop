import css from 'styled-jsx/css'

export default css`
  article {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 300px;
    position: relative;
  }

  article.intro-content {
    height: 350px;
  }

  p {
    font-size: 14px;
    margin: 0;
    line-height: 24px;
    max-width: 420px;
    text-align: center;
    cursor: default;
  }

  p.has-spacing {
    margin-top: 75px;
  }

  article.intro-content p.has-spacing {
    margin-top: 45px;
  }

  p.has-tiny-spacing {
    margin-top: 55px;
  }

  p.has-mini-spacing {
    margin-top: 15px;
  }

  code {
    border-radius: 3px;
    font-weight: 600;
    color: #d761e7;
  }

  .permission {
    color: #999999;
    font-size: 12px;
  }

  .sending-status i {
    font-weight: 700;
    font-style: normal;
    animation-name: blink;
    animation-duration: 1.4s;
    animation-iteration-count: infinite;
    animation-fill-mode: both;
    font-size: 150%;
  }

  .sending-status i:nth-child(3) {
    animation-delay: 0.2s;
  }

  .sending-status i:nth-child(4) {
    animation-delay: 0.4s;
  }

  .security-token {
    display: block;
    margin-top: 35px;
    background: #cccccc;
    color: #000;
    border-radius: 3px;
    font-weight: normal;
    padding: 10px;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.15em;
  }

  .sub {
    color: #999999;
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: 500;
    transition: all 0.2s ease;
    position: absolute;
    bottom: 0;
    -webkit-app-region: no-drag;
    cursor: default;
  }

  .sub:hover {
    color: #000;
  }

  @keyframes blink {
    0% {
      opacity: 0.1;
    }

    20% {
      opacity: 1;
    }

    100% {
      opacity: 0.2;
    }
  }
`
