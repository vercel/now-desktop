import queryString from 'query-string';
import * as idb from 'idb-keyval';
import loadData from '../../utils/load';
import { API_PROJECT_ALIASES } from '../../utils/endpoints';

export default (projectId, scope, setAliases, { token }) => {
  idb.get(`project-aliases-${projectId}`).then(lastAliases => {
    if (lastAliases) {
      setAliases(lastAliases);
    }
  });

  const defaults = { limit: 2, projectId };
  const query = Object.assign(defaults, {});

  if (!scope.isCurrentUser) {
    query.teamId = scope.id;
  }

  const params = queryString.stringify(query);
  const timeMessage = `Loaded aliases for ${projectId}`;

  console.time(timeMessage);

  loadData(`${API_PROJECT_ALIASES}?${params}`, token)
    .then(data => {
      if (!data) {
        console.error(`Failed to load aliases: ${data}`);
        return;
      }

      const { aliases } = data;
      setAliases(aliases);

      console.timeEnd(timeMessage);

      // Don't save paginated responses as latest
      if (!query.from) {
        idb.set(`project-aliases-${projectId}`, aliases);
      }
    })
    .catch(error => {
      console.error(`Failed to load aliases: ${error}`);
    });
};
