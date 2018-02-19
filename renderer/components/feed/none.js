// Packages
import { Fragment } from 'react'
import { bool } from 'prop-types'

// Styles
import styles from '../../styles/components/feed/none'

// Vectors
import FilterIcon from '../../vectors/filter'

const NoEvents = ({ filtered }) => (
  <div>
    {filtered ? (
      <Fragment>
        <h1 key="heading">No Events Available</h1>,
        <p key="description">
          There are no events matching your search pattern. Try a different
          wording!
        </p>
      </Fragment>
    ) : (
      <Fragment>
        <h1 key="heading">No Events Found</h1>,
        <p key="description">
          You can pick a different category of events using the{' '}
          <FilterIcon background="#F5F5F5" /> filter on the top.
        </p>
      </Fragment>
    )}

    <style jsx>{styles}</style>
  </div>
)

NoEvents.propTypes = {
  filtered: bool
}

export default NoEvents
