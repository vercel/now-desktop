import PropTypes from 'prop-types';
import { useRef, useReducer, useEffect, Fragment } from 'react';
import makeUnique from 'make-unique';
import deploymentsEffect from '../../effects/projects/deployments';
import scrollClearEffect from '../../effects/clear-scroll';
import Loading from '../loading';
import Deployment from './deployment';

const loadingOlder = (loadingIndicator, deployments, active, darkMode) => {
  // If no active scope has been chosen yet,
  // there's no need for this component to show.
  if (!active) {
    return null;
  }

  const last = deployments[deployments.length - 1];
  const isEnd = last && last.id === 'end';

  return (
    <aside ref={loadingIndicator} className={darkMode ? 'dark' : ''}>
      {isEnd ? (
        deployments.length === 1 ? (
          <span key="description">This project has no deployments</span>
        ) : (
          <span key="description">That’s it. No more deployments to load!</span>
        )
      ) : (
        <Fragment>
          <img key="animation" src="/static/loading.gif" />
          <span key="description">Loading Older Deployments...</span>
        </Fragment>
      )}
      <style jsx>{`
        aside {
          font-size: 12px;
          color: #666666;
          text-align: center;
          background: transparent;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 42px;
          padding-top: 10px;
          padding-bottom: 10px;
          width: 100%;
        }

        aside.dark {
          background: #333;
          color: #999;
        }

        img {
          height: 17px;
          margin-right: 8px;
        }
      `}</style>
    </aside>
  );
};

const renderDeployments = (deployments, aliases, active, online, darkMode) => {
  if (!online) {
    return <Loading darkMode={darkMode} offline deployments />;
  }

  if (!active) {
    return <Loading darkMode={darkMode} deployments />;
  }

  if (!deployments || !Array.isArray(deployments)) {
    return <Loading darkMode={darkMode} deployments />;
  }

  const productionAlias = aliases[aliases.length - 1];
  const productionDeploymentId = aliases ? productionAlias.deploymentId : null;
  const productionDeployment = deployments.find(
    d => d.uid === productionDeploymentId
  );

  return (
    <>
      {productionDeployment && (
        <Deployment
          deployment={productionDeployment}
          key={productionDeployment.uid}
          alias={productionAlias}
          darkMode={darkMode}
          expanded
        />
      )}
      {deployments
        .filter(d => d.uid !== productionDeploymentId)
        .map(deployment => {
          return (
            <Deployment
              deployment={deployment}
              key={deployment.uid}
              darkMode={darkMode}
            />
          );
        })}
    </>
  );
};

const scrolled = (
  setLoading,
  deployments,
  dispatchDeployments,
  config,
  active,
  loading,
  projectId,
  loadingIndicator,
  scrollingSection
) => {
  if (!loadingIndicator || !loadingIndicator.current) {
    return;
  }

  if (!scrollingSection || !scrollingSection.current) {
    return;
  }

  // If there are already deployments being loaded for the
  // currently active project, we do not want to trigger
  // loading even more now.
  if (loading.has(projectId)) {
    return;
  }

  const last = deployments[deployments.length - 1];
  const isEnd = last && last.id === 'end';

  // We have reached the end, so stop pulling more.
  if (isEnd) {
    return;
  }

  const section = scrollingSection.current;
  const indicator = loadingIndicator.current;
  const offset = section.offsetHeight + indicator.offsetHeight;
  const distance = section.scrollHeight - section.scrollTop;

  if (distance < offset + 100) {
    deploymentsEffect(
      projectId,
      active,
      deployments,
      setLoading,
      dispatchDeployments,
      config
    );
  }
};

const deploymentsReducer = (state, deployments) => {
  const existing = state || [];
  const updated = [...existing, ...deployments].sort(
    (a, b) => b.created < a.created
  );

  return makeUnique(updated, (a, b) => a.url === b.url);
};

const loadingReducer = (state, action) => {
  const existing = new Set(state);

  switch (action.type) {
    case 'add':
      existing.add(action.projectId);
      break;
    case 'remove':
      existing.delete(action.projectId);
      break;
    default:
      throw new Error('Action type not allowed');
  }

  return existing;
};

const ProjectDeployments = ({
  online,
  darkMode,
  scopes,
  active,
  config,
  project
}) => {
  const scrollingSection = useRef(null);
  const loadingIndicator = useRef(null);

  const [deployments, dispatchDeployments] = useReducer(deploymentsReducer, []);
  const [loading, setLoading] = useReducer(loadingReducer, new Set());

  useEffect(
    () => {
      // Wait until the active scope and all scopes are defined.
      if (scopes === null || active === null) {
        return;
      }

      return deploymentsEffect(
        project.id,
        active,
        deployments,
        setLoading,
        dispatchDeployments,
        config
      );
    },

    // Only run again if scopes or config change.
    [
      config && config.lastUpdate,
      JSON.stringify(scopes),
      JSON.stringify(active)
    ]
  );

  useEffect(
    () => {
      return scrollClearEffect(scrollingSection);
    },

    // Trigger again if the active scope changes.
    [JSON.stringify(active)]
  );

  return (
    <section
      className={darkMode ? 'dark' : ''}
      ref={scrollingSection}
      onScroll={() => {
        // Wait until the active scope and all scopes are defined.
        if (scopes === null || active === null) {
          return;
        }

        scrolled(
          setLoading,
          deployments,
          dispatchDeployments,
          config,
          active,
          loading,
          project.id,
          loadingIndicator,
          scrollingSection
        );
      }}
    >
      {renderDeployments(
        deployments,
        project.aliases,
        active,
        online,
        darkMode
      )}
      {loadingOlder(loadingIndicator, deployments, active, darkMode)}

      <style jsx>{`
        section {
          overflow-y: auto;
          overflow-x: hidden;
          background: #f0f0f0;
          user-select: none;
          cursor: default;
          flex-shrink: 1;
          position: relative;
          margin-top: -1px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        section.dark {
          background: #1f1f1f;
        }

        /*
          This is required because the element always needs
          to be at least as high as the remaining space, flex
          will shrink it down then
        */

        section {
          height: calc(100vh - 115px);
        }
      `}</style>
    </section>
  );
};

ProjectDeployments.propTypes = {
  online: PropTypes.bool,
  darkMode: PropTypes.bool,
  scopes: PropTypes.array,
  active: PropTypes.object,
  config: PropTypes.object,
  project: PropTypes.object,
  setConfig: PropTypes.func
};

export default ProjectDeployments;
