// Packages
import React from 'react'
import { bool } from 'prop-types'

const NoEvents = ({ filtered }) => (
  <div>
    {filtered
      ? <h1>No Events Found!</h1>
      : [
          <h1 key="heading">Nothing to See Here!</h1>,
          <p key="description">
            Drag a project into this window (or select it using the button on the top right) to trigger your first deployment.
          </p>
        ]}

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

      p {
        text-align: center;
        font-size: 14px;
        width: 290px;
        line-height: 22px;
      }
    `}
    </style>
  </div>
)

NoEvents.propTypes = {
  filtered: bool
}

export default NoEvents
