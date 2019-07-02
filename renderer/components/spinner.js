import React from 'react';
import PropTypes from 'prop-types';

const Spinner = ({
  color = 'black',
  width = 20,
  darkBg,
  className,
  ...props
}) => {
  const bars = [];

  const spinnerColor = darkBg ? '#eaeaea' : color;

  for (let i = 0; i < 12; i += 1) {
    const barStyle = {};
    barStyle.WebkitAnimationDelay = `${(i - 12) / 10}s`;
    barStyle.animationDelay = `${(i - 12) / 10}s`;

    barStyle.WebkitTransform = `rotate(${i * 30}deg) translate(146%)`;
    barStyle.transform = `rotate(${i * 30}deg) translate(146%)`;

    bars.push(<div style={barStyle} className="geist-spinner-bar" key={i} />);
  }

  return (
    <div className={`geist-spinner ${className || ''}`} {...props}>
      <div className="geist-spinner-inner">{bars}</div>
      <style jsx>
        {`
          .geist-spinner {
            margin-top: 2px;
            height: ${width}px;
            width: ${width}px;
          }

          .geist-spinner-inner {
            height: ${width}px;
            left: 50%;
            position: relative;
            top: 50%;
            width: ${width}px;
          }

          .geist-spinner-inner :global(.geist-spinner-bar) {
            -webkit-animation: spin 1.2s linear infinite;
            -moz-animation: spin 1.2s linear infinite;
            animation: spin 1.2s linear infinite;
            background-color: ${spinnerColor};
            border-radius: 5px;
            height: 8%;
            left: -10%;
            position: absolute;
            top: -3.9%;
            width: 24%;
          }

          @keyframes spin {
            0% {
              opacity: 1;
            }
            100% {
              opacity: 0.15;
            }
          }

          @-moz-keyframes spin {
            0% {
              opacity: 1;
            }
            100% {
              opacity: 0.15;
            }
          }

          @-webkit-keyframes spin {
            0% {
              opacity: 1;
            }
            100% {
              opacity: 0.15;
            }
          }
        `}
      </style>
    </div>
  );
};

Spinner.propTypes = {
  darkBg: PropTypes.bool,
  color: PropTypes.string,
  width: PropTypes.number,
  className: PropTypes.string
};

export default Spinner;
