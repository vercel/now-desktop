import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ipc from '../utils/ipc';

const open = event => {
  event.preventDefault();
  ipc.openURL('https://zeit.co/teams/create');
};

const CreateTeam = ({ darkMode, delay, disableScale = false }) => {
  const [scaled, setScaled] = useState(disableScale);

  useEffect(
    () => {
      if (scaled || !delay) {
        return;
      }

      const when = 100 + 100 * delay;

      const timeout = setTimeout(() => {
        setScaled(true);
      }, when);

      return () => {
        clearTimeout(timeout);
      };
    },

    // Re-run if the delay changes.
    [delay]
  );

  const classes = classNames({
    scaled,
    darkMode
  });

  return (
    <button
      onClick={open}
      tabIndex={1}
      title="Create a Team"
      className={classes}
    >
      <i />
      <i />

      <style jsx>{`
        button {
          height: 23px;
          width: 23px;
          border-radius: 100%;
          box-sizing: border-box;
          border: 1px solid #eaeaea;
          position: relative;
          flex-shrink: 0;
          margin: 0 20px 0 10px;
          display: block;
          transition: all 0.2s ease;
          transform: scale(0);
          outline: 0;
          background: 0;
        }

        button.scaled {
          transform: scale(1);
        }

        button.darkMode {
          border-color: #3a3a3a;
        }

        button:hover,
        button:focus {
          border-color: #999;
        }
        button.darkMode:hover,
        button.darkMode:focus {
          border-color: #eee;
        }

        button.darkMode:hover,
        button.darkMode:focus {
          border-color: #666;
        }

        button i {
          display: block;
          transition: all 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          top: 0;
        }

        button i:before {
          content: '';
          display: block;
          background: #999;
        }

        button.darkMode i:before,
        button:hover i:before {
          background: #999;
        }

        button.darkMode:hover i:before {
          background: #fff;
        }

        button i:first-child:before {
          height: 9px;
          width: 1px;
        }

        button i:last-child:before {
          width: 9px;
          height: 1px;
        }
      `}</style>
    </button>
  );
};

CreateTeam.propTypes = {
  delay: PropTypes.number,
  darkMode: PropTypes.bool,
  disableScale: PropTypes.bool
};

export default CreateTeam;
