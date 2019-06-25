import PropTypes from 'prop-types';
import Avatar from '../avatar';
import Placeholder from './placeholder';

function getAvatar({ member, size }) {
  if (member.githubUser) {
    return (
      <span key={member.username} className="avatar" title={member.name}>
        <Avatar avatarSize={size} githubUsername={member.username} />
      </span>
    );
  }

  if (member.gitlabUser) {
    return (
      <span key={member.username} className="avatar" title={member.name}>
        <Avatar avatarSize={size} gitlabUrl={member.url} />
      </span>
    );
  }

  if (member.username) {
    return (
      <Avatar key={member.username} size={size} username={member.username} />
    );
  }

  return <Avatar key={member.username} size={size} uid={member.uid} />;
}

getAvatar.propTypes = {
  member: PropTypes.object,
  size: PropTypes.number
};

const AvatarGroup = ({ deployments, darkBg }) => {
  if (!deployments) {
    return <Placeholder darkMode={darkBg} avatars />;
  }

  const limit = 5;
  const size = 23;

  const authorIds = {};
  const authors = [];

  for (const d of [...deployments]) {
    if (d.id === 'end') {
      break;
    }

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

    if (!authorIds[id]) {
      authorIds[id] = true;
      authors.push(author);
    }
  }

  const firstThree = authors.slice(0, limit);
  const rest = authors.slice(limit);

  return (
    <main>
      {firstThree.map(member => (
        <span className="avatar" key={member.uid || member.username}>
          {getAvatar({ member, size })}
        </span>
      ))}
      {rest.length > 0 ? <span className="note">+{rest.length}</span> : null}
      <style jsx>{`
        main {
          display: flex;
          align-items: center;
        }
        .avatar {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .avatar:nth-child(n + 2) {
          margin-left: -10px;
        }
        .note {
          font-size: 14px;
          display: inline-flex;
          padding-left: 5px;
          justify-content: flex-end;
          margin-right: auto;
          color: ${darkBg ? '#eee' : '#000'};
        }
      `}</style>
    </main>
  );
};

AvatarGroup.propTypes = {
  deployments: PropTypes.array,
  darkBg: PropTypes.bool
};

export default AvatarGroup;
