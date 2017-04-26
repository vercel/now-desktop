// Packages
import React from 'react'
import { object } from 'prop-types'

const EventMessage = ({ content }) => {
  console.log(content)
  return (
    <figure>
      <img src="https://zeit.co/api/www/avatar/?u=evilrabbit&s=80" />
      <figcaption>
        <p>
          <b>You</b>
          {' '}
          deployed
          {' '}
          <a href="zeit-website-wpytjphavg.now.sh">
            zeit-website-wpytjphavg.now.sh
          </a>
        </p>
        <span>2m ago</span>
      </figcaption>

      <style jsx>
        {`
        figure {
          margin: 0;
          display: flex;
          justify-content: space-between;
        }

        figure img {
          height: 30px;
          width: 30px;
          border-radius: 30px;
          margin: 15px 0 0 15px;
        }

        figure figcaption {
          border-top: 1px solid #D6D6D6;
          padding: 14px 14px 14px 0;
          width: 345px;
          box-sizing: border-box;
        }

        h1 + figure figcaption {
          border-top: 0;
        }

        figure:last-child figcaption {
          padding-bottom: 16px;
        }

        figure:last-child figcaption {
          border-bottom: 0;
        }

        figure figcaption span {
          font-size: 12px;
          color: #9B9B9B;
        }

        figure figcaption p {
          font-size: 13px;
          margin: 0;
          line-height: 18px;
        }

        figure figcaption a {
          color: #000;
          text-decoration: none;
          font-weight: 600;
        }

        figure figcaption a:hover {
          color: #067DF7;
        }
      `}
      </style>
    </figure>
  )
}

EventMessage.propTypes = {
  content: object
}

export default EventMessage
