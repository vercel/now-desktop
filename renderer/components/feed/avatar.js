import classNames from 'classnames';
import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

const urlPrefix = 'https://zeit.co/api/www/avatar/';

const avatarMemo = hash => {
  if (hash) {
    return `${urlPrefix}${hash}?s=80`;
  }
};

const titleEffect = (event, scope, setTitle) => {
  let title = null;

  if (event && event.user) {
    title = event.user.name || event.user.username;
  }

  if (scope) {
    title = scope.name || scope.slug || scope.username;
  }

  setTitle(title);
};

const scaleEffect = (delay, setScaled) => {
  const when = 100 + 100 * delay;

  const timeout = setTimeout(() => {
    setScaled(true);
  }, when);

  return () => {
    clearTimeout(timeout);
  };
};

const Avatar = ({ darkMode, scale, delay, event, scope, hash }) => {
  const [title, setTitle] = useState(null);
  const [scaled, setScaled] = useState(null);

  const url = useMemo(() => avatarMemo(hash), [hash]);

  const classes = classNames({
    inEvent: Boolean(event),
    darkMode,
    scale,
    scaled
  });

  useEffect(
    () => {
      return titleEffect(event, scope, setTitle);
    },

    [false]
  );

  useEffect(
    () => {
      if (!scale) {
        return;
      }

      return scaleEffect(delay, setScaled);
    },

    [false]
  );

  return (
    <div>
      <img src={url} title={title} className={classes} draggable={false} />

      <style jsx>{`
        div {
          flex-shrink: 0;
        }

        img {
          height: 23px;
          width: 23px;
          border-radius: 23px;
        }

        .darkMode {
          border: 1px solid #fff;
        }

        .scale {
          transform: scale(0);
          transition: all 0.6s;
        }

        .scaled {
          transform: scale(1);
        }

        .inEvent {
          margin: 8px 10px 0 10px;
        }
      `}</style>
    </div>
  );
};

Avatar.propTypes = {
  hash: PropTypes.string,
  event: PropTypes.object,
  scope: PropTypes.object,
  scale: PropTypes.bool,
  delay: PropTypes.number,
  darkMode: PropTypes.bool
};

export default Avatar;
