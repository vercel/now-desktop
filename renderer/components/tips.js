import { useState } from 'react';
import { bool, object } from 'prop-types';
import styles from '../styles/components/tips';
import Bulb from '../vectors/bulb';
import Clear from '../vectors/clear';
import { saveConfig } from '../utils/ipc';

const tips = [];

if (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel') {
  tips.push({
    id: 'pasteFromClipboard',
    component: (
      <span>
        Use <kbd>⌘</kbd> + <kbd>V</kbd> to deploy files
        <style>{`
          kbd {
            font-family: Monaco, Lucida Console, Liberation Mono, serif;
            padding: 1px 4px 0 4px;
            border-radius: 3px;
            background-color: rgba(0, 0, 0, 0.10);
            font-size: 10px;
            margin: 5px 0;
            display: inline-block;
          }
        `}</style>
      </span>
    )
  });
}

const closeTip = async setTip => {
  try {
    await saveConfig(
      {
        desktop: {
          shownTips: { [this.state.tip.id]: true }
        }
      },
      'config'
    );
  } catch (err) {
    // Nothing to do here, as there is a default
  }

  setTip(null);
};

const Tips = ({ darkBg, config }) => {
  const shownTips =
    (config && config.desktop && config.desktop.shownTips) || {};
  const defaultTip = tips.find(({ id }) => !shownTips[id]);
  const [tip, setTip] = useState(defaultTip);

  if (!tip) {
    return null;
  }

  return (
    <div>
      <section className={`tip${darkBg ? ' dark' : ''}`} key={tip.id}>
        <span className="icon">
          <Bulb />
        </span>
        <p>
          <b>Tip:</b> {tip.component}
        </p>
        <span className="icon clickable close" onClick={() => closeTip(setTip)}>
          <Clear color={darkBg ? '#999' : '#4e4e4e'} />
        </span>
      </section>

      <style jsx>{styles}</style>
    </div>
  );
};

Tips.propTypes = {
  darkBg: bool,
  config: object
};

export default Tips;
