import queryString from 'query-string';
import loadData from '../utils/load';
import { API_EVENTS } from '../utils/endpoints';
import Messages from '../components/messages';

const types = [...new Set(Messages.keys())];

const loadEvents = (
  setLoading,
  scope,
  events,
  dispatchEvents,
  { token },
  type
) => {
  // It's extremely important that this fires early, otherwise
  // there are multiple loaders being created for loading when scrolling.
  setLoading({
    type: 'add',
    scope: scope.id
  });

  const defaults = { limit: 30, types };
  const query = Object.assign(defaults, {});
  const existing = events[scope.id];

  if (!scope.isCurrentUser) {
    query.teamId = scope.id;
  }

  if (Array.isArray(existing) && existing.length > 0) {
    if (type === 'prepend') {
      const start = Date.parse(existing[0].created) + 1;
      query.since = new Date(start).toISOString();
    } else if (type === 'append') {
      const end = Date.parse(existing[existing.length - 1].created) + 1;
      query.until = new Date(end).toISOString();
    }
  }

  if (query.types) {
    query.types = query.types.join(',');
  }

  const params = queryString.stringify(query);
  const timeMessage = `Loaded events for ${scope.slug}`;

  console.time(timeMessage);

  loadData(`${API_EVENTS}?${params}`, token)
    .then(data => {
      if (!data || !data.events) {
        console.error(`Failed to load events: ${data}`);
        return;
      }

      const events = data.events;
      const { length } = events;

      // If there are no (0) or less than 30 (batch size)
      // events available in the response, we know that
      // we reached the end.
      if (type === 'append' && length < 30) {
        events.push({
          id: 'end'
        });
      }

      dispatchEvents({
        type,
        scope: scope.id,
        events
      });

      setLoading({
        type: 'remove',
        scope: scope.id
      });

      console.timeEnd(timeMessage);
    })
    .catch(err => {
      setLoading({
        type: 'remove',
        scope: scope.id
      });

      console.error(`Failed to load events: ${err}`);
    });
};

export default (
  setLoading,
  scopes,
  active,
  events,
  dispatchEvents,
  config,
  type
) => {
  // Make sure the currently active scope is
  // always first pulled.
  const toPull = [active];

  // If there are no events for the active scope yet, it means
  // we're loading events for the first time. In that case, we want to
  // pre-fill all the scopes with events.
  if (!events[active.id] && type !== 'append') {
    const left = scopes.filter(scope => {
      return scope.id !== active.id;
    });

    for (const scope of left) {
      toPull.push(scope);
    }
  }

  Promise.all(
    toPull.map(scope => {
      return loadEvents(
        setLoading,
        scope,
        events,
        dispatchEvents,
        config,
        type
      );
    })
  );
};
