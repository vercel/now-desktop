// Packages
import electron from 'electron'
import React from 'react'
import { bool } from 'prop-types'

// Styles
import styles from '../../styles/components/feed/none'

// Vectors
import FilterIcon from '../../vectors/filter'

const openDocs = event => {
  event.preventDefault()
  const remote = electron.remote || false

  if (remote) {
    remote.shell.openExternal('https://zeit.co')
  }
}

const NoEvents = ({ filtered }) =>
  <div>
    {filtered
      ? [
          <h1 key="heading">No Events Found!</h1>,
          <p key="description">
            You can pick a different category of events using the{' '}
            <FilterIcon background="#F5F5F5" /> filter on the top.
          </p>
        ]
      : [
          <h1 key="heading">No Activity to Show!</h1>,
          <p key="description">
            Drag a project into this window (or select it using the button on
            the top right) to trigger{' '}
            <b onClick={openDocs}>your first deployment</b>
            .
          </p>
        ]}

    <style jsx>
      {styles}
    </style>
  </div>

NoEvents.propTypes = {
  filtered: bool
}

export default NoEvents
