import PropTypes from 'prop-types';

const Placeholder = ({
  width = '100%',
  height = '16px',
  style = {},
  avatars,
  darkMode
}) => (
  <div className="content-placeholder" style={style}>
    <style jsx>
      {`
        .content-placeholder {
          animation: linear 1.5s placeholder infinite;
          background: #f6f7f8;
          background: linear-gradient(
            to right,
            ${darkMode ? '#444' : '#eeeeee'} 8%,
            ${darkMode ? '#666' : '#dddddd'} 18%,
            ${darkMode ? '#444' : '#eeeeee'} 33%
          );
          background-size: 800px 104px;
          border-radius: ${avatars ? 12 : 3}px;

          width: ${avatars ? '23px' : width || 0};
          height: ${avatars ? '23px' : height || 0};
        }

        @keyframes placeholder {
          0% {
            background-position: -468px 0;
          }
          100% {
            background-position: 468px 0;
          }
        }
      `}
    </style>
  </div>
);

Placeholder.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  style: PropTypes.object,
  avatars: PropTypes.array,
  darkMode: PropTypes.bool
};

export default Placeholder;
