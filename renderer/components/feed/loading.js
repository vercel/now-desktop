import { bool } from 'prop-types';
import styles from '../../styles/components/feed/loading';

const Loading = ({ offline, darkMode = false }) => (
  <aside className={darkMode ? 'dark' : ''}>
    <section>
      <img src="/static/loading.gif" />
      <p>{offline ? 'Waiting for a Connection...' : 'Loading Events...'}</p>
    </section>

    <style jsx>{styles}</style>
  </aside>
);

Loading.propTypes = {
  darkMode: bool,
  offline: bool
};

export default Loading;
