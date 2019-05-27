import PropTypes from 'prop-types';
import Done from '../vectors/done';

const Progress = ({ progress = 0 }) => {
  if (progress >= 100) {
    return <Done color="white" />;
  }

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.5">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1000 10"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="progress"
        />
      </g>
      <style jsx>{`
        .progress {
          stroke-dasharray: ${91 - progress * 0.32};
          stroke-dashoffset: 120;
          transition: all 0.15s ease;
        }
      `}</style>
    </svg>
  );
};

Progress.propTypes = {
  progress: PropTypes.number
};

export default Progress;
