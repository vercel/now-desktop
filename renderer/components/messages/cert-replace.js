// Components
import { Fragment } from 'react';
import Message from './message';

export default class CertReplace extends Message {
  render() {
    const { event } = this.props;
    const { cn, cns } = event.payload;

    let domains = cns || cn;
    domains = Array.isArray(domains) ? domains : [domains];
    domains = domains.map(domain => <b key={domain}>{domain}</b>);

    return (
      <p>
        {this.getDisplayName()}
        replaced a certificate for{' '}
        {domains.map((domain, index) => {
          const hasNext = domains[index + 1];
          const isLast = domain === domains[domains.length - 1];
          const isPreLast = domain === domains[domains.length - 2];

          if (isLast && domains.length > 1) {
            return (
              <Fragment key={domain}>
                {' '}
                and <b>{domain}</b>
              </Fragment>
            );
          }

          if (hasNext && !isPreLast) {
            return (
              <Fragment key={domain}>
                <b>{domain}</b>,{' '}
              </Fragment>
            );
          }

          return (
            <Fragment key={domain}>
              <b>{domain}</b>
            </Fragment>
          );
        })}
      </p>
    );
  }
}
