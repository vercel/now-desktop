import queryString from 'query-string';
import * as idb from 'idb-keyval';
import loadData from '../../utils/load';
import { API_PROJECTS } from '../../utils/endpoints';

const loadProjects = (
  setLoading,
  scope,
  projects,
  dispatchProjects,
  { token }
) => {
  idb.get(`last-projects-${scope.id}`).then(lastProjects => {
    if (lastProjects) {
      dispatchProjects({
        scope: scope.id,
        projects: lastProjects
      });
    }
  });
  // It's extremely important that this fires early, otherwise
  // there are multiple loaders being created for loading when scrolling.
  setLoading({
    type: 'add',
    scope: scope.id
  });

  const defaults = { limit: 10 };
  const query = Object.assign(defaults, {});
  const existing = projects[scope.id];

  if (!scope.isCurrentUser) {
    query.teamId = scope.id;
  }

  if (Array.isArray(existing) && existing.length > 0) {
    const last = existing[existing.length - 1];
    query.from = last.updatedAt + 1;
  }

  const params = queryString.stringify(query);
  const timeMessage = `Loaded projects for ${scope.slug}`;

  console.time(timeMessage);

  loadData(`${API_PROJECTS}?${params}`, token)
    .then(projects => {
      if (!projects) {
        console.error(`Failed to load projects: ${projects}`);
        return;
      }

      const { length } = projects;

      // If there are no (0) or less than 10 (batch size)
      // projects available in the response, we know that
      // we reached the end.
      if (length < 10) {
        projects.push({
          id: 'end'
        });
      }

      dispatchProjects({
        scope: scope.id,
        projects
      });

      setLoading({
        type: 'remove',
        scope: scope.id
      });

      console.timeEnd(timeMessage);

      // Don't save paginated responses as latest
      if (!query.from) {
        idb.set(`last-projects-${scope.id}`, projects);
      }
    })
    .catch(error => {
      setLoading({
        type: 'remove',
        scope: scope.id
      });

      console.error(`Failed to load projects: ${error}`);
    });
};

export default (
  setLoading,
  scopes,
  active,
  projects,
  dispatchProjects,
  config
) => {
  // Make sure the currently active scope is
  // always first pulled.
  const toPull = [active];

  // If there are no projects for the active scope yet, it means
  // we're loading projects for the first time. In that case, we want to
  // pre-fill all the scopes with projects.
  if (!projects[active.id]) {
    const left = scopes.filter(scope => {
      return scope.id !== active.id;
    });

    for (const scope of left) {
      toPull.push(scope);
    }
  }

  Promise.all(
    toPull.map(scope => {
      return loadProjects(
        setLoading,
        scope,
        projects,
        dispatchProjects,
        config
      );
    })
  );
};
