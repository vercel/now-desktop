// Packages
import React from 'react'

const Loading = () => (
  <div>
    <figure>
      <figcaption>Loading Events...</figcaption>
    </figure>

    <style jsx>
      {`
      div {
        display: flex;
        width: 100%;
        height: 100%;
        position: absolute;
        background: #F5F5F5;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }
    `}
    </style>
  </div>
)

export default Loading
