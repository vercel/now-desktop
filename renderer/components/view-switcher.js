import PropTypes from 'prop-types';

const ViewSwitcher = ({ darkMode, activeView, onViewChange }) => {
  return (
    <ul className={darkMode ? 'dark' : ''}>
      <li className={`projects ${activeView === 'projects' ? 'active' : ''}`}>
        <button onClick={() => onViewChange('projects')}>Projects</button>
      </li>
      <li className={`events ${activeView === 'events' ? 'active' : ''}`}>
        <button onClick={() => onViewChange('events')}>Events</button>
      </li>
      <style jsx>
        {`
          ul {
            list-style: none;
            padding: 0;
            padding-top: 1px;
            padding-bottom: 12px;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
          }

          ul.dark {
            background-color: #3a3a3a;
          }

          button {
            background: 0;
            font-size: 12px;
            color: black;
            border: 1px solid #eaeaea;
            width: 85px;
            height: 20px;
            text-align: center;
            outline: 0;
          }

          button:focus {
            border-color: #0076ff;
          }

          .dark button {
            color: white;
            border-color: #666;
          }
          .dark button:focus {
            border-color: #0076ff;
          }

          .projects button {
            border-right: 0;
            border-top-left-radius: 5px;
            border-bottom-left-radius: 5px;
          }

          .events button {
            border-left: 0;
            border-top-right-radius: 5px;
            border-bottom-right-radius: 5px;
          }

          .active button {
            background-color: #0076ff;
            border-color: #0076ff;
            color: white;
          }
        `}
      </style>
    </ul>
  );
};

ViewSwitcher.propTypes = {
  darkMode: PropTypes.bool,
  activeView: PropTypes.string,
  onViewChange: PropTypes.func
};

export default ViewSwitcher;
