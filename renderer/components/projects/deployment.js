import ms from 'ms';
import PropTypes from 'prop-types';
import ipc from '../../utils/ipc';
import Avatar from '../avatar';
import External from '../../vectors/external';
import { StatusDot } from './status';

const getAvatar = d => {
  let id;
  let author;

  if (d.meta && d.meta.githubDeployment) {
    id = d.meta.githubCommitAuthorLogin;
    author = {
      githubUser: true,
      username: id,
      name: d.meta.githubCommitAuthorName
    };
  } else if (d.meta && d.meta.gitlabDeployment) {
    id = d.meta.gitlabCommitAuthorLogin;
    author = {
      gitlabUser: true,
      username: id,
      name: d.meta.gitlabCommitAuthorName,
      url: d.meta.gitlabCommitAuthorAvatar
    };
  } else {
    id = d.creator.uid;
    author = d.creator;
  }

  if (author.githubUser) {
    return (
      <Avatar
        githubUsername={author.username}
        title={author.username || author.email}
        size={20}
      />
    );
  }

  if (author.gitlabUser) {
    return (
      <Avatar
        url={author.url}
        title={author.username || author.email}
        size={20}
      />
    );
  }

  return (
    <Avatar
      uid={author.uid}
      title={author.username || author.email}
      size={20}
    />
  );
};

const Deployment = ({ deployment, alias, expanded, darkMode }) => {
  if (deployment.id === 'end') {
    return null;
  }

  const classNames = [];

  if (expanded) {
    classNames.push('expanded');
  }

  if (darkMode) {
    classNames.push('dark');
  }

  return (
    <article className={classNames.join(' ')}>
      {expanded ? (
        <>
          <div className="row">
            <a
              className="alias"
              onClick={() => ipc.openURL(`https://${alias.alias}`)}
              title={`https://${alias.alias}`}
            >
              <span>{alias.alias}</span>
              <External color="#0076FF" />
            </a>
            {getAvatar(deployment)}
          </div>
          <div className="row">
            <span title={deployment.url}>{deployment.url}</span>
            <div>
              <StatusDot {...deployment} style={{ marginLeft: 15 }} />
              <span className="date">
                {ms(Date.now() - deployment.created)} ago
              </span>
            </div>
          </div>
        </>
      ) : (
        <>
          <a
            onClick={() => ipc.openURL(`https://${deployment.url}`)}
            title={`https://${deployment.url}`}
          >
            <span>{deployment.url}</span>
            <External darkMode={darkMode} />
          </a>
          <div className="meta">
            {getAvatar(deployment)}
            <StatusDot {...deployment} style={{ marginLeft: 15 }} />
            <span>{ms(Date.now() - deployment.created)} ago</span>
          </div>
        </>
      )}
      <style jsx>
        {`
          article {
            background-color: white;
            min-height: ${expanded ? 50 : 20}px;
            padding: 10px;
            padding-left: 20px;
            padding-right: 20px;
            width: 290px;
            border-top: 1px solid ${darkMode ? '#444' : '#eaeaea'};
            display: flex;
            align-items: center;
            justify-content: space-between;
            ${expanded
              ? `
            border-bottom: 1px solid ${darkMode ? '#444' : '#eaeaea'};
            margin-top: 24px;
            margin-bottom: 24px;
            `
              : ''}
          }

          .dark {
            background-color: #1f1f1f;
          }

          article.expanded {
            flex-direction: column;
          }

          a {
            font-size: 13px;
            display: flex;
            align-items: center;
            width: 165px;
          }

          a span {
            width: 85%;
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            overflow-x: hidden;
            text-overflow: ellipsis;
          }

          .expanded a {
            color: #0076ff;
          }

          .meta {
            display: flex;
            align-items: center;
            margin-left: 5px;
            flex-grow: 1;
          }

          .meta span {
            color: #666;
            font-size: 13px;
            font-weight: 500;
            flex-grow: 1;
            text-align: right;
          }

          .row {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 500;
          }

          .dark .row {
            background-color: #1f1f1f;
          }

          .row a {
            width: auto;
            max-width: 85%;
            font-size: 13px;
            font-weight: 500;
          }

          .row a span {
            width: 100%;
            margin-right: 5px;
          }

          .row span {
            font-size: 13px;
            font-weight: 500;
            width: 65%;
            overflow-x: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .row .date {
            color: #666;
          }

          .dark span {
            color: white;
          }

          .dark .date,
          .dark .meta span {
            color: #999;
          }

          .dark.expanded a span {
            color: #0079ff;
          }
        `}
      </style>
    </article>
  );
};

Deployment.propTypes = {
  deployment: PropTypes.object,
  alias: PropTypes.object,
  expanded: PropTypes.bool,
  darkMode: PropTypes.bool
};

export default Deployment;
