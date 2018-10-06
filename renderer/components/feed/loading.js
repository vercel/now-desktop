// Packages
import { bool } from 'prop-types'

// Styles
import styles from '../../styles/components/feed/loading'

const Loading = ({ offline, darkBg = false }) => (
  <aside className={darkBg ? 'dark' : ''}>
    <section>
      <img src="/static/loading.gif" />
      <p>{offline ? 'Waiting for a Connection...' : 'Loading Events...'}</p>
    </section>

    <style jsx>{styles}</style>
  </aside>
)

Loading.propTypes = {
  darkBg: bool,
  offline: bool
}

export default Loading
