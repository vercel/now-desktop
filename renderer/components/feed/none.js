import { Fragment } from 'react';
import { bool } from 'prop-types';
import styles from '../../styles/components/feed/none';

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
          Deploy something or create a new alias in order to trigger a new
          event.
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
