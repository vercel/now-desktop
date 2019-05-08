import PropTypes from 'prop-types';
import Done from '../vectors/done';
import Deploy from '../vectors/deploy';
import ipc from '../utils/ipc';
import Tips from './tips';

const Title = ({ darkMode, active, config, contextChanged }) => {
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
          <div className="context-changed">Context updated for Now CLI</div>
        )}

        <span className="deploy" onClick={() => ipc.openDeployDialog()}>
          <Deploy darkBg={darkMode} />
        </span>
      </div>

      <section className="update-message">
        <Done />
        <p>Context updated for Now CLI!</p>
      </section>

      <Tips darkMode={darkMode} config={config} />

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
          border-bottom: 1px solid #d6d6d6;
          overflow: hidden;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
          flex-shrink: 0;
        }

        aside.dark {
          background: #2c2c2c;
          background: linear-gradient(
            180deg,
            rgba(64, 64, 64, 1) 0%,
            rgba(51, 51, 51, 1) 100%
          );
          border-bottom: 1px solid #000;
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

        .deploy {
          position: absolute;
          height: 36px;
          width: 36px;
          top: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: opacity 0.2s ease;
        }

        .deploy:hover {
          opacity: 1;
        }

        .deploy {
          opacity: 0.5;
          right: 0;
        }

        .deploy.hidden {
          opacity: 0;
        }

        .windows {
          border-radius: 0;
        }

        .update-message {
          opacity: 0;
          transition: opacity 0.5s ease;
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          background: #fff;
          font-size: 12px;
          align-items: center;
          display: flex;
          padding-left: 17px;
          pointer-events: none;
          height: 35px;
        }

        .dark .update-message {
          color: #fff;
          background: #2c2c2c;
        }

        .update-message p {
          margin-left: 12px;
        }

        .scope-updated .update-message {
          opacity: 1;
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
        aside.dark .context-changed {
          color: #fff;
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
  active: PropTypes.object,
  config: PropTypes.object,
  contextChanged: PropTypes.bool
};

export default Title;
