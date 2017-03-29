// Packages
import React from 'react';

// Helpers
import remote from '../utils/electron';

const loadLicenses = () => {
  const getLicenses = remote.require('load-licenses');
  const mainModule = remote.process.mainModule;

  return getLicenses(mainModule);
};

const Licenses = () => (
  <section>
    {loadLicenses().map(item => {
      return (
        <details>
          <summary>{item.name}</summary>
          <p>{item.license}</p>
        </details>
      );
    })}
    <style jsx>
      {
        `
      details {
        margin-bottom: 10px;
      }

      details summary {
        color: #707070;
        font-size: 12px;
        cursor: pointer;
        transition: color .2s ease;
        display: inline-block;
      }

      details summary:focus {
        outline: none;
      }

      details[open] summary {
        color: #000;
      }

      details summary:hover {
        color: #000;
      }
    `
      }
    </style>
  </section>
);

export default Licenses;
