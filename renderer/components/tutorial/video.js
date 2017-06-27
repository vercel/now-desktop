// Packages
import React from 'react'

const Video = () => {
  const videoSettings = {
    preload: true,
    loop: true,
    src: '/static/tutorial/drag-and-drop.webm'
  }

  return (
    <figure>
      <figcaption>
        <h2>Deploy anything</h2>
        <h1>Drag And Drop any Folder or File</h1>
      </figcaption>

      <video {...videoSettings} />

      <style jsx>
        {`
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
            background: #EAEAEA;
            height: 1px;
            width: 100%;
            display: block;
          }
          figcaption {
            text-align: center;
            margin-bottom: 20px;
          }
          h1 {
            font-size: 25px;
            font-weight: normal;
            margin: 10px 0 0 0;
          }
          h2 {
            font-size: 12px;
            color: #067DF7;
            text-transform: uppercase;
            font-weight: normal;
            margin: 0;
            letter-spacing: 1px;
          }
          video {
            width: 500px;
          }
        `}
      </style>
    </figure>
  )
}

export default Video
