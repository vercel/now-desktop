import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Progress from './progress';

const clamp = (num, min, max) => {
  return Math.max(min, Math.min(num, max));
};

const getContent = options => {
  const {
    activeDeployment,
    builds,
    readyBuilds,
    hashesCalculated,
    filesUploaded
  } = options;

  if (!activeDeployment) {
    return null;
  }

  if (activeDeployment.ready) {
    return <span>Deployed successfully!</span>;
  }

  return activeDeployment.name ? (
    <span>
      Deploying{' '}
      <strong>
        {activeDeployment.name}{' '}
        {builds && builds.length > 0 ? `${readyBuilds} / ${builds.length}` : ''}
      </strong>
    </span>
  ) : (
    <span>
      {filesUploaded
        ? 'Deploying...'
        : hashesCalculated
        ? 'Uploading files...'
        : 'Preparing...'}
    </span>
  );
};

const getProgress = ({
  builds,
  readyBuilds,
  filesUploaded,
  hashesCalculated,
  activeDeployment
}) => {
  const progress =
    builds && builds > 0 ? (readyBuilds / builds.length) * 100 : 0;

  if (progress === 0) {
    if (activeDeployment && activeDeployment.name) {
      return 40;
    }

    if (filesUploaded) {
      return 20;
    }

    if (hashesCalculated) {
      return 10;
    }
  }

  return builds && builds > 0 ? clamp(progress, 50, 95) : 0;
};

const getErrorMessage = error => {
  if (error.message) {
    return error.message;
  }

  if (error.code) {
    if (error.code === 'rate_limited') {
      return 'Too many requests. Try again in a few minutes';
    }

    return error.code;
  }

  if (error.toString() === '[object Object]') {
    return JSON.stringify(error);
  }

  return error.toString();
};

const DeploymentBar = ({
  activeDeployment,
  activeDeploymentBuilds: builds,
  error,
  filesUploaded,
  hashesCalculated,
  onErrorClick
}) => {
  const [hiding, setHiding] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!activeDeployment && !error) {
      setHiding(true);
      setTimeout(() => {
        setHidden(true);
      }, 200);
    } else {
      setHiding(false);
      setHidden(false);
    }
  }, [activeDeployment, error]);

  const readyBuilds = builds.filter(build => build.readyState).length;
  const progress = getProgress({
    builds,
    readyBuilds,
    filesUploaded,
    hashesCalculated,
    activeDeployment
  });

  return hidden ? null : (
    <div className={`deployment-bar ${hiding ? 'hiding' : ''}`}>
      {error ? (
        <div className="content" onClick={() => onErrorClick()}>
          <span>{getErrorMessage(error)}</span>
        </div>
      ) : (
        <div className="content">
          {getContent({
            activeDeployment,
            builds,
            readyBuilds,
            hashesCalculated,
            filesUploaded
          })}
          <Progress
            progress={
              activeDeployment && activeDeployment.ready ? 100 : progress
            }
          />
        </div>
      )}
      <style jsx>
        {`
          .deployment-bar {
            background-color: ${error ? 'red' : '#0076FF'};
            width: 100%;
            height: 42px;
            maxheight: 60px;
            color: white;
            display: flex;
            align-items: center;
            font-size: 12px;
            position: fixed;
            left: 0;
            bottom: 40px;
            opacity: 0;
            animation: 0.2s show ease forwards;
            z-index: 0;
          }

          .content {
            padding-left: 10px;
            padding-right: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            user-select: none;
            cursor: default;
          }

          .deployment-bar.hiding {
            animation: 0.2s hide ease forwards;
          }

          @keyframes show {
            from {
              opacity: 0;
              transform: translateY(60px);
            }
            to {
              opacity: 1;
              transform: translateY(0px);
            }
          }

          @keyframes hide {
            from {
              opacity: 1;
              transform: translateY(0px);
            }
            to {
              opacity: 0;
              transform: translateY(60px);
            }
          }
        `}
      </style>
    </div>
  );
};

DeploymentBar.propTypes = {
  activeDeployment: PropTypes.object,
  activeDeploymentBuilds: PropTypes.array,
  error: PropTypes.object,
  filesUploaded: PropTypes.bool,
  hashesCalculated: PropTypes.bool,
  onErrorClick: PropTypes.func
};

export default DeploymentBar;
