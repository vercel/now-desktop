// Packages
import React from 'react'

const Loading = () => (
  <aside>
    <section>
      <span>
        <b />
        <b />
        <b />
      </span>

      <p>Loading Events...</p>
    </section>

    <style jsx>
      {`
      aside {
        display: flex;
        width: 100%;
        height: 100%;
        position: absolute;
        background: #F5F5F5;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }

      p {
        margin: 15px 0 0 0;
        color: #999;
        font-weight: 500;
      }

      span {
        margin: 0 auto 0 auto;
        width: 70px;
        text-align: center;
        display: block;
      }

      span b {
        width: 13px;
        height: 13px;
        background-color: #999999;
        margin: 0 3px;
        border-radius: 100%;
        display: inline-block;
        -webkit-animation: sbouncedelay 1.4s infinite ease-in-out both;
        animation: bouncedelay 1.4s infinite ease-in-out both;
      }

      span b:nth-child(1) {
        -webkit-animation-delay: -0.32s;
        animation-delay: -0.32s;
      }

      span b:nth-child(2) {
        -webkit-animation-delay: -0.16s;
        animation-delay: -0.16s;
      }

      @-webkit-keyframes bouncedelay {
        0%, 80%, 100% { -webkit-transform: scale(0) }
        40% { -webkit-transform: scale(1.0) }
      }

      @keyframes bouncedelay {
        0%, 80%, 100% {
          -webkit-transform: scale(0);
          transform: scale(0);
        } 40% {
          -webkit-transform: scale(1.0);
          transform: scale(1.0);
        }
      }
    `}
    </style>
  </aside>
)

export default Loading
