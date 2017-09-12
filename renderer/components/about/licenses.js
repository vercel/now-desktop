// Packages
import electron from 'electron'
import React from 'react'
import getLicenses from 'load-licenses'

// Styles
import styles from '../../styles/components/about/licenses'

const loadLicenses = () => {
  const remote = electron.remote || false

  if (!remote) {
    return []
  }

  return getLicenses(remote.process.mainModule)
}

const Licenses = () => (
  <section>
    {loadLicenses().map((item, index) => {
      return (
        item.name.includes('now-desktop') || (
          <details key={index}>
            <summary>{item.name}</summary>
            <p>{item.license}</p>
          </details>
        )
      )
    })}

    <style jsx>{styles}</style>
  </section>
)

export default Licenses
