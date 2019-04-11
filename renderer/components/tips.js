import { useState, useEffect } from 'react';
import { bool, object } from 'prop-types';
import styles from '../styles/components/tips';
import Bulb from '../vectors/bulb';
import Clear from '../vectors/clear';
import ipc from '../utils/ipc';

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

const closeTip = async (tip, setShownTips) => {
  const desktop = {
    shownTips: { [tip.id]: true }
  };

  try {
    await ipc.saveConfig(
      {
        desktop
      },
      'config'
    );
  } catch (err) {
    // Nothing to do here, as there is a default
  }

  setShownTips(desktop.shownTips);
};

const Tips = ({ darkMode, config }) => {
  const [shownTips, setShownTips] = useState(null);

  useEffect(() => {
    if (!config || shownTips !== null) {
      return;
    }

    const desktopConfig = config && config.desktop;
    const alreadyShown = (desktopConfig && config.desktop.shownTips) || {};

    setShownTips(alreadyShown);
  });

  const tip = tips.find(({ id }) => shownTips && !shownTips[id]);

  if (!tip) {
    return null;
  }

  return (
    <div>
      <section className={`tip${darkMode ? ' dark' : ''}`} key={tip.id}>
        <span className="icon">
          <Bulb />
        </span>
        <p>
          <b>Tip:</b> {tip.component}
        </p>
        <span
          className="icon clickable close"
          onClick={() => closeTip(tip, setShownTips)}
        >
          <Clear color={darkMode ? '#999' : '#4e4e4e'} />
        </span>
      </section>

      <style jsx>{styles}</style>
    </div>
  );
};

Tips.propTypes = {
  darkMode: bool,
  config: object
};

export default Tips;
