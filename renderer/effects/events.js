import queryString from 'query-string';
import loadData from '../utils/data/load';
import { API_EVENTS } from '../utils/data/endpoints';

const loadEvents = (scope, dispatchEvents, { token }) => {
  const defaults = { limit: 30 };
  const query = Object.assign(defaults, {});

  if (!scope.isCurrentUser) {
    query.teamId = scope.id;
  }

  if (query.types) {
    query.types = Array.from(query.types).join(',');
  }

  const params = queryString.stringify(query);
  const timeMessage = `Loaded events for ${scope.slug}`;

  console.time(timeMessage);

  loadData(`${API_EVENTS}?${params}`, token).then(data => {
    if (!data || !data.events) {
      console.error(`Failed to load events: ${data}`);
      return;
    }

    dispatchEvents({
      scope: scope.id,
      events: data.events
    });

    console.timeEnd(timeMessage);
  });
};

export default (scopes, active, events, dispatchEvents, config) => {
  // Make sure the currently active scope is
  // always first pulled.
  const toPull = [active];

  // If there are no events for the active scope yet, it means
  // we're loading events for the first time. In that case, we want to
  // pre-fill all the scopes with events.
  if (!events[active.id]) {
    const left = scopes.filter(scope => {
      return scope.id !== active.id;
    });

    for (const scope of left) {
      toPull.push(scope);
    }
  }

  Promise.all(
    toPull.map(scope => {
      return loadEvents(scope, dispatchEvents, config);
    })
  );
};
