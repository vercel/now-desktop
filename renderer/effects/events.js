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
  const scopesWithoutActive = scopes.filter(scope => {
    return scope.id !== active.id;
  });

  // Bring the currently active scope to the front.
  const orderedScopes = [active, ...scopesWithoutActive];

  Promise.all(
    orderedScopes.map(scope => {
      return loadEvents(scope, dispatchEvents, config);
    })
  );
};
