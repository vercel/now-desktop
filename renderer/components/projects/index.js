import PropTypes from 'prop-types';
import { useRef, useReducer, useEffect, Fragment } from 'react';
import makeUnique from 'make-unique';
import projectsEffect from '../../effects/projects';
import scrollClearEffect from '../../effects/clear-scroll';
import Loading from '../loading';
import Project from './project';

const loadingOlder = (loadingIndicator, projects, active, darkMode) => {
  // If no active scope has been chosen yet,
  // there's no need for this component to show.
  if (!active) {
    return null;
  }

  // If there are no projects in total, no projects for this scope
  // or less than 10 projects for this scope (which is the number of
  // projects we're loading in one pull), we already know
  // that there is no need for loading more.
  if (!projects || !projects[active.id] || projects[active.id].length < 10) {
    return null;
  }

  const last = projects[active.id][projects[active.id].length - 1];
  const isEnd = last && last.id === 'end';

  return (
    <aside ref={loadingIndicator} className={darkMode ? 'dark' : ''}>
      {isEnd ? (
        <span key="description">That’s it. No more projects to load!</span>
      ) : (
        <Fragment>
          <img key="animation" src="/static/loading.gif" />
          <span key="description">Loading Older Projects...</span>
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
          padding-top: 5px;
          padding-bottom: 10px;
          width: 100%;
        }

        aside.dark {
          background: #1f1f1f;
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

const renderProjects = (
  projects,
  setSelectedProject,
  active,
  online,
  config,
  darkMode
) => {
  if (!online) {
    return <Loading darkMode={darkMode} offline projects />;
  }

  if (!active) {
    return <Loading darkMode={darkMode} projects />;
  }

  const scopedProjects = projects[active.id];

  if (!scopedProjects) {
    return <Loading darkMode={darkMode} projects />;
  }

  return scopedProjects.map(project => {
    return (
      <Project
        project={project}
        key={project.id}
        scope={active}
        config={config}
        darkMode={darkMode}
        setSelectedProject={setSelectedProject}
      />
    );
  });
};

const scrolled = (
  setLoading,
  scopes,
  projects,
  dispatchProjects,
  config,
  loading,
  active,
  loadingIndicator,
  scrollingSection
) => {
  if (!loadingIndicator || !loadingIndicator.current) {
    return;
  }

  if (!scrollingSection || !scrollingSection.current) {
    return;
  }

  // If there are already projects being loaded for the
  // currently active scope, we do not want to trigger
  // loading even more now.
  if (loading.has(active.id)) {
    return;
  }

  const last = projects[active.id][projects[active.id].length - 1];
  const isEnd = last && last.id === 'end';

  // We have reached the end, so stop pulling more.
  if (isEnd) {
    return;
  }

  const section = scrollingSection.current;
  const indicator = loadingIndicator.current;
  const offset = section.offsetHeight + indicator.offsetHeight;
  const distance = section.scrollHeight - section.scrollTop;

  if (distance < offset + 300) {
    projectsEffect(
      setLoading,
      scopes,
      active,
      projects,
      dispatchProjects,
      config,
      'append'
    );
  }
};

const projectsReducer = (state, action) => {
  const existing = state[action.scope] || [];
  const updated = [...existing, ...action.projects];

  return Object.assign({}, state, {
    [action.scope]: makeUnique(updated, (a, b) => a.id === b.id)
  });
};

const loadingReducer = (state, action) => {
  const existing = new Set(state);

  switch (action.type) {
    case 'add':
      existing.add(action.scope);
      break;
    case 'remove':
      existing.delete(action.scope);
      break;
    default:
      throw new Error('Action type not allowed');
  }

  return existing;
};

const Projects = ({
  online,
  darkMode,
  scopes,
  active,
  config,
  setSelectedProject
}) => {
  const scrollingSection = useRef(null);
  const loadingIndicator = useRef(null);

  const [projects, dispatchProjects] = useReducer(projectsReducer, {});
  const [loading, setLoading] = useReducer(loadingReducer, new Set());

  useEffect(
    () => {
      // Wait until the active scope and all scopes are defined.
      if (scopes === null || active === null) {
        return;
      }

      return projectsEffect(
        setLoading,
        scopes,
        active,
        projects,
        dispatchProjects,
        config,
        'prepend'
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
          scopes,
          projects,
          dispatchProjects,
          config,
          loading,
          active,
          loadingIndicator,
          scrollingSection
        );
      }}
    >
      {renderProjects(
        projects,
        setSelectedProject,
        active,
        online,
        config,
        darkMode
      )}
      {loadingOlder(loadingIndicator, projects, active, darkMode)}

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
          height: calc(100vh - 109px);
        }
      `}</style>
    </section>
  );
};

Projects.propTypes = {
  online: PropTypes.bool,
  darkMode: PropTypes.bool,
  scopes: PropTypes.array,
  active: PropTypes.object,
  config: PropTypes.object,
  setConfig: PropTypes.func,
  setSelectedProject: PropTypes.func
};

export default Projects;
