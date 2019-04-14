import PropTypes from 'prop-types';

const Loading = ({ offline, darkMode }) => (
  <aside className={darkMode ? 'dark' : ''}>
    <section>
      <img src="/static/loading.gif" />
      <p>{offline ? 'Waiting for a Connection...' : 'Loading Events...'}</p>
    </section>

    <style jsx>{`
      aside {
        display: flex;
        width: 100%;
        height: 100%;
        position: absolute;
        background: #f5f5f5;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }

      aside.dark {
        background: #1f1f1f;
      }

      img {
        width: 30px;
        margin: 0 auto;
        display: block;
      }

      p {
        margin: 10px 0 0 0;
        color: #999;
        font-size: 13px;
      }
    `}</style>
  </aside>
);

Loading.propTypes = {
  darkMode: PropTypes.bool,
  offline: PropTypes.bool
};

export default Loading;
