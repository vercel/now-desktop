// Packages
import React from 'react'

// Components
import { StickyContainer, Sticky } from 'react-sticky'
import Title from '../components/title'

const Feed = () => (
  <div>
    <Title light>Now</Title>

    <StickyContainer style={{marginTop: '37px'}}>
      <section>
        <Sticky topOffset={-37} stickyStyle={{top: 37}}>
          <h1>November 2016</h1>
        </Sticky>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=evilrabbit&s=80"/>
          <figcaption>
            <p><b>You</b> deployed <a href="zeit-website-wpytjphavg.now.sh">zeit-website-wpytjphavg.now.sh</a></p>
            <span>2m ago</span>
          </figcaption>
        </figure>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=rauchg&s=80"/>
          <figcaption>
            <p><b>rauchg</b> aliased <a href="https://zeit-now-rfzwcvdfya.now.sh">zeit-now-rfzwcvdfya.now.sh</a> to <a href="https://nowbeta.zeit.co">nowbeta.zeit.co</a></p>
            <span>5m ago</span>
          </figcaption>
        </figure>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=rase-&s=80"/>
          <figcaption>
            <p><b>rase-</b> deployed <a href="https://sk-flow-iuyosykbyi.now.sh">sk-flow-iuyosykbyi.now.sh</a></p>
            <span>1h ago</span>
          </figcaption>
        </figure>
      </section>

      <section>
        <Sticky topOffset={-37} stickyStyle={{top: 37}}>
          <h1>October 2016</h1>
        </Sticky>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=nkzawa&s=80"/>
          <figcaption>
            <p><b>nkzawa</b> deployed <a href="https://sk-flow-iuyosykbyi.now.sh">sk-flow-iuyosykbyi.now.sh</a></p>
            <span>2h ago</span>
          </figcaption>
        </figure>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=hbp&s=80"/>
          <figcaption>
            <p><b>hbp</b> aliased <a href="https://zeit-now-rfzwcvdfya.now.sh">zeit-now-rfzwcvdfya.now.sh</a> to <a href="https://nowbeta.zeit.co">nowbeta.zeit.co</a></p>
            <span>1d ago</span>
          </figcaption>
        </figure>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=evilrabbit&s=80"/>
          <figcaption>
            <p><b>You</b> deployed <a href="zeit-website-wpytjphavg.now.sh">zeit-website-wpytjphavg.now.sh</a></p>
            <span>2d ago</span>
          </figcaption>
        </figure>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=rauchg&s=80"/>
          <figcaption>
            <p><b>rauchg</b> aliased <a href="https://zeit-now-rfzwcvdfya.now.sh">zeit-now-rfzwcvdfya.now.sh</a> to <a href="https://nowbeta.zeit.co">nowbeta.zeit.co</a></p>
            <span>3d ago</span>
          </figcaption>
        </figure>
      </section>

      <section>
        <Sticky topOffset={-37} stickyStyle={{top: 37}}>
          <h1>September 2016</h1>
        </Sticky>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=evilrabbit&s=80"/>
          <figcaption>
            <p><b>You</b> deployed <a href="zeit-website-wpytjphavg.now.sh">zeit-website-wpytjphavg.now.sh</a></p>
            <span>5d ago</span>
          </figcaption>
        </figure>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=rauchg&s=80"/>
          <figcaption>
            <p><b>rauchg</b> aliased <a href="https://zeit-now-rfzwcvdfya.now.sh">zeit-now-rfzwcvdfya.now.sh</a> to <a href="https://nowbeta.zeit.co">nowbeta.zeit.co</a></p>
            <span>10d ago</span>
          </figcaption>
        </figure>

        <figure>
          <img src="https://zeit.co/api/www/avatar/?u=rase-&s=80"/>
          <figcaption>
            <p><b>rase-</b> deployed <a href="https://sk-flow-iuyosykbyi.now.sh">sk-flow-iuyosykbyi.now.sh</a></p>
            <span>11d ago</span>
          </figcaption>
        </figure>
      </section>
    </StickyContainer>

    <style jsx>
    {`
      h1 {
        background: #F5F5F5;
        font-size: 14px;
        height: 30px;
        line-height: 30px;
        padding: 0 10px;
        color: #000;
        margin: 20px 0 0 0;
      }

      h1:first-child {
        margin-top: 0;
      }

      section {
        padding-bottom: 20px;
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

      figure figcaption span {
        font-size: 12px;
        color: #9B9B9B;
      }

      figure figcaption p {
        font-size: 14px;
        margin: 0;
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
        -webkit-app-region: drag;
        background: #fff;
        -webkit-font-smoothing: antialiased;
        margin: 0;
      }
    `}
    </style>
  </div>
)

export default Feed
