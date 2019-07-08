import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Progress from './progress';

const clamp = (num, min, max) => {
  return Math.max(min, Math.min(num, max));
};

const getContent = options => {
  const {
    activeDeployment,
    activeBuilds,
    readyBuildsCount,
    hashesCalculated,
    filesUploaded,
    queued
  } = options;

  if (queued) {
    const nameSegments =
      typeof queued === 'string'
        ? queued.split('/')
        : Array.isArray(queued)
        ? queued[0].split('/')
        : [''];
    const name = nameSegments[nameSegments.length - 1] || null;

    return (
      <span>
        Queued <strong>{name}</strong>
      </span>
    );
  }

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
        {activeBuilds > 0 ? `${readyBuildsCount} / ${activeBuilds}` : ''}
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
  activeBuilds,
  readyBuildsCount,
  filesUploaded,
  hashesCalculated,
  activeDeployment,
  queued
}) => {
  if (queued) {
    return 0;
  }

  const progress =
    activeBuilds > 0 ? (readyBuildsCount / activeBuilds) * 100 : 0;

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

  return activeBuilds > 0 ? clamp(progress, 50, 95) : 0;
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
    return error.message || 'An error occured with your deployment';
  }

  return error.toString();
};

const DeploymentBar = ({
  activeDeployment,
  activeBuilds,
  readyBuilds,
  error,
  filesUploaded,
  hashesCalculated,
  onErrorClick,
  pasteNoticeVisible,
  queued
}) => {
  const [hiding, setHiding] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!activeDeployment && !error && !pasteNoticeVisible) {
      setHiding(true);
      setTimeout(() => {
        setHidden(true);
      }, 200);
    } else {
      setHiding(false);
      setHidden(false);
    }
  }, [activeDeployment, error, pasteNoticeVisible]);

  const readyBuildsCount = Object.keys(readyBuilds).length;

  const progress = getProgress({
    activeBuilds,
    readyBuildsCount,
    filesUploaded,
    hashesCalculated,
    activeDeployment,
    queued
  });

  return hidden ? null : (
    <div className={`deployment-bar ${hiding ? 'hiding' : ''}`}>
      {error ? (
        <div className="content" onClick={() => onErrorClick()}>
          <span>{getErrorMessage(error)}</span>
        </div>
      ) : pasteNoticeVisible ? (
        <div className="content">
          <span>
            Paste to deploy is no longer supported. Drop your files into this
            area to deploy.
          </span>
        </div>
      ) : (
        <div className="content">
          {getContent({
            activeDeployment,
            activeBuilds,
            readyBuildsCount,
            hashesCalculated,
            filesUploaded,
            queued
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
            background-color: ${error
              ? 'red'
              : pasteNoticeVisible
              ? '#ffb917'
              : '#0076FF'};
            width: 100%;
            height: 42px;
            maxheight: 60px;
            color: white;
            display: flex;
            align-items: center;
            font-size: 12px;
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
  activeBuilds: PropTypes.number,
  readyBuilds: PropTypes.object,
  error: PropTypes.object,
  filesUploaded: PropTypes.bool,
  hashesCalculated: PropTypes.bool,
  pasteNoticeVisible: PropTypes.bool,
  queued: PropTypes.string,
  onErrorClick: PropTypes.func
};

export default DeploymentBar;
