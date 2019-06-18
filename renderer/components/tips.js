import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Bulb from '../vectors/bulb';
import Clear from '../vectors/clear';
import ipc from '../utils/ipc';

const tips = [];

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
  } catch (error) {
    // Nothing to do here, as there is a default
  }

  setShownTips(desktop.shownTips);
};

const Tips = ({ darkMode, config }) => {
  const [shownTips, setShownTips] = useState(null);

  useEffect(
    () => {
      if (config === null) {
        return;
      }

      const desktopConfig = config && config.desktop;
      const alreadyShown = (desktopConfig && config.desktop.shownTips) || {};

      setShownTips(alreadyShown);
    },

    // Only execute if the config has changed
    [config && config.lastUpdate]
  );

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

      <style jsx>{`
        .tip {
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          background: #fff;
          font-size: 12px;
          align-items: center;
          display: flex;
          justify-content: space-between;
          height: 35px;
          filter: grayscale(1);
        }

        .tip.dark {
          background: #2c2c2c;
          background: linear-gradient(
            180deg,
            rgba(64, 64, 64, 1) 0%,
            rgba(51, 51, 51, 1) 100%
          );
          color: #999;
        }

        .tip .icon {
          height: inherit;
          width: 36px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }

        .tip .icon.clickable {
          opacity: 0.5;
          transition: opacity 0.2s ease;
        }

        .tip .icon.clickable:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

Tips.propTypes = {
  darkMode: PropTypes.bool,
  config: PropTypes.object
};

export default Tips;
