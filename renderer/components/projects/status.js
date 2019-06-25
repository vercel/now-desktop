import ms from 'ms';
import PropTypes from 'prop-types';
import cn from 'classnames';
import ipc from '../../utils/ipc';
import Placeholder from './placeholder';

export const StatusDot = ({ title, state, style, url }) => {
  return (
    <span
      title={title || 'Status: ' + state}
      className={cn('status', {
        ready: state === 'READY',
        error: state === 'ERROR',
        empty: !state,
        init: state !== 'ERROR' && state !== 'READY'
      })}
      onClick={() =>
        ipc.openURL(
          `https://zeit.co/deployments/${url}${
            state === 'ERROR' ? '/logs' : ''
          }`
        )
      }
      style={style}
    >
      <style jsx>{`
        .status {
          display: inline-block;
          width: 12px;
          height: 12px;
          margin-right: 5px;
          border-radius: 6px;
        }
        .status.ready {
          background: #50e3c2;
        }
        .status.error {
          background: red;
        }
        .status.init {
          background: #f5a623;
        }
        .status.empty {
          background: #d4d4d4;
        }
      `}</style>
    </span>
  );
};

StatusDot.propTypes = {
  title: PropTypes.string,
  state: PropTypes.string,
  style: PropTypes.object,
  url: PropTypes.string
};

const Status = ({ deployments, darkMode }) => {
  const latest = deployments ? deployments[0] : null;

  if (!latest) {
    return <Placeholder width="100px" darkMode={darkMode} />;
  }

  return (
    <div className="status">
      {latest && latest.created && (
        <>
          <StatusDot {...latest} /> Updated {ms(Date.now() - latest.created)}{' '}
          ago
        </>
      )}
      <style jsx>
        {`
          .status {
            align-self: flex-end;
            color: ${darkMode ? '#999' : '#666'};
            font-size: 12px;
            font-weight: 500;
            display: flex;
            align-items: center;
          }
        `}
      </style>
    </div>
  );
};

Status.propTypes = {
  deployments: PropTypes.array,
  darkMode: PropTypes.boolean
};

export default Status;
