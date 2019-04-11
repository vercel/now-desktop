import PropTypes from 'prop-types';
import styles from '../styles/components/title';
import Done from '../vectors/done';
import Deploy from '../vectors/deploy';
import Tips from './tips';

const Title = ({ darkMode, active, config }) => {
  const classes = [];

  if (darkMode) {
    classes.push('dark');
  }

  if (process.platform === 'win32') {
    classes.push('windows');
  }

  return (
    <aside className={classes.join(' ')}>
      <div>
        {active && <h1>{active.name}</h1>}

        <span className="deploy" onClick={() => console.log('test')}>
          <Deploy darkBg={darkMode} />
        </span>
      </div>

      <section className="update-message">
        <Done />
        <p>Context updated for Now CLI!</p>
      </section>

      <Tips darkMode={darkMode} config={config} />

      <style jsx>{styles}</style>
    </aside>
  );
};

Title.propTypes = {
  darkMode: PropTypes.bool,
  active: PropTypes.object,
  config: PropTypes.object
};

export default Title;
