import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import deploymentsEffect from '../../effects/projects/deployments';
import aliasesEffect from '../../effects/projects/aliases';
import ipc from '../../utils/ipc';
import Status from './status';
import Placeholder from './placeholder';
import AvatarGroup from './avatar-group';

const noop = () => {};

const Project = ({ project, scope, config, setSelectedProject, darkMode }) => {
  const [deployments, setDeployments] = useState(null);
  const [aliases, setAliases] = useState(null);

  const { name, id } = project;

  useEffect(() => {
    return deploymentsEffect(
      id,
      scope,
      deployments,
      noop,
      setDeployments,
      config
    );
  }, [id]);

  useEffect(() => {
    return aliasesEffect(id, scope, setAliases, config);
  }, [id]);

  const alias = aliases ? aliases[aliases.length - 1] : null;

  if (id === 'end') {
    return null;
  }

  return (
    <article className={darkMode ? 'dark' : ''}>
      <section>
        <h3 onClick={() => setSelectedProject({ ...project, aliases })}>
          {name}
        </h3>
        <AvatarGroup deployments={deployments} darkMode={darkMode} />
      </section>
      <section>
        {deployments &&
        deployments.length === 1 &&
        deployments[0].id === 'end' ? (
          <span className="empty">No deployments in this project</span>
        ) : null}
        {aliases ? (
          alias ? (
            <a
              onClick={() => ipc.openURL(`https://${alias.alias}`)}
              title={`https://${alias.alias}`}
            >
              {alias.alias}
            </a>
          ) : (
            <div />
          )
        ) : (
          <Placeholder darkMode={darkMode} width="120px" />
        )}
        <Status deployments={deployments} darkMode={darkMode} />
      </section>
      <style jsx>
        {`
          article {
            min-height: 74px;
            max-height: 74px;
            width: 270px;
            border-radius: 5px;
            background: white;
            margin-bottom: 10px;
            padding: 0 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: space-between;
          }

          article:first-child {
            margin-top: 10px;
          }

          .dark {
            background-color: #2a2a2a;
          }

          section {
            display: flex;
            justify-content: space-between;
          }

          section:last-child {
            margin-top: 5px;
            align-items: flex-end;
          }

          h3 {
            margin: 0;
            font-size: 18px;
          }

          .dark h3 {
            color: white;
          }

          a {
            font-size: 13px;
            color: #0076ff;
            align-self: flex-end;
            font-weight: 500;
            overflow-x: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            max-width: 50%;
          }

          .empty {
            color: #999;
            font-size: 13px;
            font-weight: 500;
            margin-top: 2px;
          }
        `}
      </style>
    </article>
  );
};

Project.propTypes = {
  project: PropTypes.object,
  scope: PropTypes.object,
  config: PropTypes.object,
  setSelectedProject: PropTypes.func,
  darkMode: PropTypes.bool
};

export default Project;
