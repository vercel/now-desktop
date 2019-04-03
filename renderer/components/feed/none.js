// Packages
import { Fragment } from 'react';
import { bool } from 'prop-types';

// Styles
import styles from '../../styles/components/feed/none';

// Vectors
import FilterIcon from '../../vectors/filter';

const NoEvents = ({ filtered, darkBg = false }) => (
  <div className={darkBg ? 'dark' : ''}>
    {filtered ? (
      <Fragment>
        <h1>No Events Available</h1>
        <p>
          There are no events matching your search pattern. Try a different
          wording.
        </p>
      </Fragment>
    ) : (
      <Fragment>
        <h1>No Events Found</h1>
        <p>
          You can pick a different category of events using the{' '}
          <FilterIcon darkBg={darkBg} background="#F5F5F5" /> filter on the top.
        </p>
      </Fragment>
    )}

    <style jsx>{styles}</style>
  </div>
);

NoEvents.propTypes = {
  filtered: bool,
  darkBg: bool
};

export default NoEvents;
