import { Component } from 'react';
import introStyles from '../../styles/components/tutorial/intro';
import Button from './button';

class End extends Component {
  showApp = event => {
    event.preventDefault();
  };

  render() {
    return (
      <article>
        <p>
          <b>{`It's that simple!`}</b>
        </p>

        <p className="has-mini-spacing">
          Are you ready to deploy something now? If so, simply click the button
          below to view the event feed:
        </p>

        <Button onClick={this.showApp} className="get-started">
          Get Started
        </Button>
        <style jsx>{introStyles}</style>
      </article>
    );
  }
}

export default End;
