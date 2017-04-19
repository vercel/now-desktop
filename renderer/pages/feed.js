// Packages
import React from 'react'

// Components
import Title from '../components/title'
import Caret from '../vectors/caret'

const Feed = () => (
  <div>
    <span className="caret">
      <Caret />
    </span>

    <Title light>Now</Title>

    <main>
      <section>
        <h1>November 2016</h1>

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
        </figure>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=rauchg&s=80" />
          <figcaption>
            <p>
              <b>rauchg</b>
              {' '}
              aliased
              {' '}
              <a href="https://zeit-now-rfzwcvdfya.now.sh">
                zeit-now-rfzwcvdfya.now.sh
              </a>
              {' '}
              to
              {' '}
              <a href="https://nowbeta.zeit.co">nowbeta.zeit.co</a>
            </p>
            <span>5m ago</span>
          </figcaption>
        </figure>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=rase-&s=80" />
          <figcaption>
            <p>
              <b>rase-</b>
              {' '}
              deployed
              {' '}
              <a href="https://sk-flow-iuyosykbyi.now.sh">
                sk-flow-iuyosykbyi.now.sh
              </a>
            </p>
            <span>1h ago</span>
          </figcaption>
        </figure>
      </section>

      <section>
        <h1>October 2016</h1>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=nkzawa&s=80" />
          <figcaption>
            <p>
              <b>nkzawa</b>
              {' '}
              deployed
              {' '}
              <a href="https://sk-flow-iuyosykbyi.now.sh">
                sk-flow-iuyosykbyi.now.sh
              </a>
            </p>
            <span>2h ago</span>
          </figcaption>
        </figure>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=hbp&s=80" />
          <figcaption>
            <p>
              <b>hbp</b>
              {' '}
              aliased
              {' '}
              <a href="https://zeit-now-rfzwcvdfya.now.sh">
                zeit-now-rfzwcvdfya.now.sh
              </a>
              {' '}
              to
              {' '}
              <a href="https://nowbeta.zeit.co">nowbeta.zeit.co</a>
            </p>
            <span>1d ago</span>
          </figcaption>
        </figure>

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
            <span>2d ago</span>
          </figcaption>
        </figure>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=rauchg&s=80" />
          <figcaption>
            <p>
              <b>rauchg</b>
              {' '}
              aliased
              {' '}
              <a href="https://zeit-now-rfzwcvdfya.now.sh">
                zeit-now-rfzwcvdfya.now.sh
              </a>
              {' '}
              to
              {' '}
              <a href="https://nowbeta.zeit.co">nowbeta.zeit.co</a>
            </p>
            <span>3d ago</span>
          </figcaption>
        </figure>
      </section>

      <section>
        <h1>September 2016</h1>

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
            <span>5d ago</span>
          </figcaption>
        </figure>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=rauchg&s=80" />
          <figcaption>
            <p>
              <b>rauchg</b>
              {' '}
              aliased
              {' '}
              <a href="https://zeit-now-rfzwcvdfya.now.sh">
                zeit-now-rfzwcvdfya.now.sh
              </a>
              {' '}
              to
              {' '}
              <a href="https://nowbeta.zeit.co">nowbeta.zeit.co</a>
            </p>
            <span>10d ago</span>
          </figcaption>
        </figure>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=rase-&s=80" />
          <figcaption>
            <p>
              <b>rase-</b>
              {' '}
              deployed
              {' '}
              <a href="https://sk-flow-iuyosykbyi.now.sh">
                sk-flow-iuyosykbyi.now.sh
              </a>
            </p>
            <span>11d ago</span>
          </figcaption>
        </figure>
      </section>
    </main>

    <aside>
      <nav />

      <a className="toggle-menu">
        <span>
          <i />
          <i />
          <i />
        </span>
      </a>
    </aside>

    <style jsx>
      {`
      main {
        overflow: scroll;
        height: calc(100vh - 90px);
        background: #fff;
        user-select: none;
        cursor: default;
      }

      .caret {
        display: flex;
        justify-content: center;
        margin-bottom: -1px;
      }

      aside {
        height: 50px;
        bottom: 0;
        left: 0;
        right: 0;
        position: fixed;
        border-top: 1px solid #D6D6D6;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        background: #fff;
        user-select: none;
        cursor: default;
      }

      aside .toggle-menu {
        display: block;
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
      }

      aside .toggle-menu i {
        width: 20px;
        height: 1px;
        background: #5d5d5d;
        display: block;
        opacity: .6;
      }

      aside .toggle-menu:hover i {
        opacity: 1;
      }

      aside span i:nth-child(2) {
        margin: 3px 0;
      }

      h1 {
        background: #F5F5F5;
        font-size: 14px;
        height: 30px;
        line-height: 30px;
        padding: 0 10px;
        color: #000;
        margin: 0;
        position: sticky;
        top: 0;
      }

      h1:first-child {
        margin-top: 0;
      }

      section {
        padding: 2px 0;
        display: flex;
        flex-direction: column;
      }

      section:first-child {
        padding-top: 0;
      }

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
        border-bottom: 1px solid #D6D6D6;
        padding: 15px 15px 15px 0;
        width: 345px;
        box-sizing: border-box;
      }

      figure:last-child figcaption {
        border-bottom: 0;
      }

      figure figcaption span {
        font-size: 12px;
        color: #9B9B9B;
      }

      figure figcaption p {
        font-size: 14px;
        margin: 0;
        line-height: 18px;
      }

      figure figcaption a {
        color: #000;
        text-decoration: none;
        font-weight: 600;
      }
    `}
    </style>

    <style jsx global>
      {`
      body {
        font-family: BlinkMacSystemFont;
        -webkit-font-smoothing: antialiased;
        margin: 0;
        overflow: hidden;
      }
    `}
    </style>
  </div>
)

export default Feed
