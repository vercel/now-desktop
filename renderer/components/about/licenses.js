// Packages
import electron from 'electron'
import getLicenses from 'load-licenses'
import { bool } from 'prop-types'

// Styles
import styles from '../../styles/components/about/licenses'

const loadLicenses = () => {
  const remote = electron.remote || false

  if (!remote) {
    return []
  }

  return getLicenses(remote.process.mainModule)
}

const Licenses = ({ darkBg = false }) => (
  <section className={darkBg ? 'dark' : ''}>
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

Licenses.propTypes = {
  darkBg: bool
}

export default Licenses
