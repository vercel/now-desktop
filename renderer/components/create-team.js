import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ipc from '../utils/ipc';

const open = event => {
  event.preventDefault();
  ipc.openURL('https://zeit.co/teams/create');
};

const CreateTeam = ({ darkMode, delay }) => {
  const [scaled, setScaled] = useState(false);

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
    <a onClick={open} title="Create a Team" className={classes}>
      <i />
      <i />

      <style jsx>{`
        a {
          height: 23px;
          width: 23px;
          border-radius: 100%;
          box-sizing: border-box;
          border: 1px solid #e8e8e8;
          position: relative;
          flex-shrink: 0;
          margin: 0 20px 0 10px;
          display: block;
          transition: all 0.2s ease;
          transform: scale(0);
        }

        a.scaled {
          transform: scale(1);
        }

        a.darkMode,
        a:hover {
          border-color: #333;
        }

        a.darkMode:hover {
          border-color: #666;
        }

        a i {
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

        a i:before {
          content: '';
          display: block;
          background: #666;
        }

        a.darkMode i:before,
        a:hover i:before {
          background: #666;
        }

        a.darkMode:hover i:before {
          background: #fff;
        }

        a i:first-child:before {
          height: 9px;
          width: 1px;
        }

        a i:last-child:before {
          width: 9px;
          height: 1px;
        }
      `}</style>
    </a>
  );
};

CreateTeam.propTypes = {
  delay: PropTypes.number,
  darkMode: PropTypes.bool
};

export default CreateTeam;
