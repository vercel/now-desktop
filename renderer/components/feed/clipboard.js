// Packages
import { string, arrayOf, func } from 'prop-types'

// Styles
import styles from '../../styles/components/feed/clipboard'

const Clipboard = ({ clipboardContents, onClick }) => (
  <aside onClick={onClick}>
    <section>
      <p>Deploy {clipboardContents.length} files from clipboard?</p>
    </section>

    <style jsx>{styles}</style>
  </aside>
)

Clipboard.propTypes = {
  clipboardContents: arrayOf(string).isRequired,
  onClick: func
}

export default Clipboard
