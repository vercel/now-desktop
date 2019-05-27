import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Progress from './progress';

const getContent = (activeDeployment, builds, readyBuilds) => {
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
    <span>Preparing...</span>
  );
};

const DeploymentBar = ({
  activeDeployment,
  activeDeploymentBuilds: builds,
  error,
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
  const progress =
    builds && builds > 0 ? (readyBuilds / builds.length) * 100 : 0;

  return hidden ? null : (
    <div className={`deployment-bar ${hiding ? 'hiding' : ''}`}>
      {error ? (
        <div className="content" onClick={() => onErrorClick()}>
          <span>{error.message.replace('DeploymentError: ', '')}</span>
        </div>
      ) : (
        <div className="content">
          {getContent(activeDeployment, builds, readyBuilds)}
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
  onErrorClick: PropTypes.func
};

export default DeploymentBar;
