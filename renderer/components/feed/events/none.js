// Packages
import electron from 'electron'
import React from 'react'
import { bool } from 'prop-types'

const openDocs = event => {
  event.preventDefault()
  const remote = electron.remote || false

  if (remote) {
    remote.shell.openExternal('https://zeit.co')
  }
}

const NoEvents = ({ filtered }) => (
  <div>
    {filtered
      ? <h1>No Events Found!</h1>
      : [
          <h1 key="heading">No Activity to Show!</h1>,
          <p key="description">
            Drag a project into this window (or select it using the button on the top right) to trigger
            {' '}
            <b onClick={openDocs}>your first deployment</b>
            .
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

      h1 {
        font-size: 16px;
      }

      p {
        text-align: center;
        font-size: 12px;
        width: 250px;
        line-height: 20px;
      }

      b {
        font-weight: 600;
      }
    `}
    </style>
  </div>
)

NoEvents.propTypes = {
  filtered: bool
}

export default NoEvents
