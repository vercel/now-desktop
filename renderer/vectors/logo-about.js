// Packages
import React from 'react';
import PropTypes from 'prop-types';

const Logo = ({ darkMode, ...props }) =>
  darkMode ? (
    <svg
      width="70"
      height="70"
      viewBox="0 0 70 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="35" cy="35" r="35" fill="black" />
      <path
        d="M34.7238 20L49.4476 46H20L34.7238 20Z"
        fill="url(#paint0_linear)"
      />
      <defs>
        <linearGradient
          id="paint0_linear"
          x1="104.214"
          y1="60.4376"
          x2="67.2966"
          y2="9.42644"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopColor="white" />
        </linearGradient>
      </defs>
      <style jsx>{`
        svg {
          box-shadow: 0px 30px 60px rgba(0, 0, 0, 0.12);
          border-radius: 50%;
        }
      `}</style>
    </svg>
  ) : (
    <svg
      width="70"
      height="70"
      viewBox="0 0 70 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="35" cy="35" r="35" fill="white" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M35.32 20L50.14 46H20.5L35.32 20Z"
        fill="url(#paint0_linear)"
      />
      <defs>
        <linearGradient
          id="paint0_linear"
          x1="62.4618"
          y1="59.4427"
          x2="47.7983"
          y2="36.4755"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" />
        </linearGradient>
      </defs>
      <style jsx>{`
        svg {
          box-shadow: 0px 30px 60px rgba(0, 0, 0, 0.12);
          border-radius: 50%;
        }
      `}</style>
    </svg>
  );

Logo.propTypes = {
  darkMode: PropTypes.bool
};

export default Logo;
