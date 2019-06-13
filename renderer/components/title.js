import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Deploy from '../vectors/deploy';
import Done from '../vectors/done';
import Back from '../vectors/back';
import Tips from './tips';

let contextMessageTimeout;

const Title = ({
  darkMode,
  active,
  config,
  title,
  fileInput,
  online,
  onBackClick
}) => {
  const [contextChanged, setContextChanged] = useState(false);

  const onContextChange = () => {
    if (!contextMessageTimeout) {
      setContextChanged(true);

      contextMessageTimeout = setTimeout(() => {
        setContextChanged(false);
        contextMessageTimeout = null;
      }, 1200);
    }
  };

  const getPrevious = currentActive => {
    const ref = useRef();

    useEffect(() => {
      ref.current = currentActive;
    });

    return ref.current;
  };

  const activeId = active ? active.id : null;
  const lastActive = getPrevious(activeId);

  useEffect(() => {
    if (!activeId || (activeId && !lastActive)) {
      return;
    }

    onContextChange();
  }, [activeId]);

  const classes = [];

  if (darkMode) {
    classes.push('dark');
  }

  if (process.platform === 'win32') {
    classes.push('windows');
  }

  return (
    <aside className={classes.join(' ')}>
      <div className="title-top-container">
        {active && (
          <h1 className={contextChanged ? 'hide' : ''}>{active.name}</h1>
        )}
        {contextChanged && (
          <div className="context-changed">
            <Done />
            <p>Context updated for Now CLI</p>
          </div>
        )}

        {title ? (
          <h1>{title}</h1>
        ) : (
          <>
            <button
              className="deploy"
              onClick={() => {
                if (fileInput && online) {
                  fileInput.click();
                }
              }}
            >
              <Deploy darkBg={darkMode} />
            </button>
          </>
        )}
        {title === 'About' && (
          <button className="close back" onClick={onBackClick}>
            <Back darkMode={darkMode} />
          </button>
        )}
      </div>

      {!title && <Tips darkMode={darkMode} config={config} />}

      <style jsx>{`
        aside {
          height: 35px;
          display: block;
          position: relative;
          justify-content: center;
          align-items: center;
          top: 0;
          left: 0;
          right: 0;
          background: #fff;
          z-index: 5;
          user-select: none;
          cursor: default;
          overflow: hidden;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
          flex-shrink: 0;
        }

        aside.dark {
          background: ${title === 'About' ? '#1f1f1f' : '#3a3a3a'};
        }

        h1 {
          margin: 0;
          color: #000000;
          font-size: 13px;
          letter-spacing: 0.02em;
          font-weight: 600;
        }

        h1.hide {
          animation: 1.2s header-hide ease forwards;
        }

        aside.dark h1 {
          color: #fff;
        }

        .deploy,
        .close {
          position: absolute;
          height: 36px;
          width: 36px;
          top: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: opacity 0.2s ease;
          color: black;
          border: 0;
          background: 0;
          outline: 0;
        }

        .deploy:hover,
        .deploy:focus,
        .close:hover,
        .close:focus {
          opacity: 1;
        }

        .deploy,
        .close {
          opacity: 0.5;
          right: 0;
          cursor: default;
        }

        .back {
          left: 0;
        }

        .deploy.hidden,
        .close.hidden {
          opacity: 0;
        }

        .windows {
          border-radius: 0;
        }

        div {
          transition: opacity 0.5s ease;
          height: 36px;
          width: 100vw;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .scope-updated div {
          opacity: 0;
        }

        .context-changed {
          width: 100%;
          height: 100%;
          font-size: 12px;
          opacity: 0;
          animation: 1.2s context-change ease forwards;
          position: absolute;
          width: 240px;
          left: calc(50% - 120px);
        }

        .context-changed p {
          margin-left: 5px;
        }

        aside.dark .context-changed {
          color: #fff;
        }

        aside.dark .deploy,
        aside.dark .close {
          color: white;
        }

        @keyframes context-change {
          0% {
            opacity: 0;
            transform: translate3d(0, 10px, 0);
          }
          30% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          70% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          100% {
            opacity: 0;
            transform: translate3d(0, -10px, 0);
          }
        }

        @keyframes header-hide {
          0% {
            opacity: 1;
            transform: translate3d(0, 0px, 0);
          }
          30% {
            opacity: 0;
            transform: translate3d(0, -10px, 0);
          }
          70% {
            opacity: 0;
            transform: translate3d(0, 10px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </aside>
  );
};

Title.propTypes = {
  darkMode: PropTypes.bool,
  title: PropTypes.string,
  active: PropTypes.object,
  config: PropTypes.object,
  contextChanged: PropTypes.bool,
  fileInput: PropTypes.object,
  online: PropTypes.bool,
  onBackClick: PropTypes.func
};

export default Title;
