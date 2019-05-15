import PropTypes from 'prop-types';
import Progress from './progress';

const getContent = (activeDeployment, builds, readyBuilds) => {
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
  error
}) => {
  if (!activeDeployment && !error) {
    return null;
  }

  const readyBuilds = builds.filter(build => build.readyState).length;
  const progress = builds && builds > 0 ? readyBuilds / builds.length * 100 : 0;

  return (
    <div>
      {error ? (
        <div className="content">
          <span>{error.message.replace('DeploymentError: ', '')}</span>
        </div>
      ) : (
        <div className="content">
          {getContent(activeDeployment, builds, readyBuilds)}
          <Progress progress={activeDeployment.ready ? 100 : progress} />
        </div>
      )}
      <style jsx>
        {`
          div {
            background-color: ${error ? 'red' : '#0076FF'};
            width: 100%;
            height: 42px;
            color: white;
            display: flex;
            align-items: center;
            font-size: 12px;
            padding-top: 5px;
            padding-bottom: 5px;
          }

          .content {
            padding-left: 10px;
            padding-right: 10px;
            display: flex;
            justify-content: space-between;
          }
        `}
      </style>
    </div>
  );
};

DeploymentBar.propTypes = {
  activeDeployment: PropTypes.object,
  activeDeploymentBuilds: PropTypes.array,
  error: PropTypes.object
};

export default DeploymentBar;
