import queryString from 'query-string';
import * as idb from 'idb-keyval';
import loadData from '../../utils/load';
import { API_PROJECT_DEPLOYMENTS } from '../../utils/endpoints';

export default (
  projectId,
  scope,
  deployments,
  setLoading,
  setDeployments,
  { token }
) => {
  idb.get(`project-deployments-${projectId}`).then(lastDeployments => {
    if (lastDeployments) {
      setDeployments(lastDeployments);
    }
  });

  // It's extremely important that this fires early, otherwise
  // there are multiple loaders being created for loading when scrolling.
  setLoading({
    type: 'add',
    projectId
  });

  const defaults = { limit: 10, projectId };
  const query = Object.assign(defaults, {});
  const existing = deployments;

  if (!scope.isCurrentUser) {
    query.teamId = scope.id;
  }

  if (Array.isArray(existing) && existing.length > 0) {
    const last = existing[existing.length - 1];
    query.from = last.created + 1;
  }

  const params = queryString.stringify(query);
  const timeMessage = `Loaded deployments for ${projectId}`;

  console.time(timeMessage);

  loadData(`${API_PROJECT_DEPLOYMENTS}?${params}`, token)
    .then(data => {
      if (!data) {
        console.error(`Failed to load deployments: ${data}`);
        return;
      }

      const { deployments } = data;
      const { length } = deployments;

      // If there are no (0) or less than 10 (batch size)
      // deployments available in the response, we know that
      // we reached the end.
      if (length < 10) {
        deployments.push({
          id: 'end'
        });
      }

      setDeployments(deployments);

      setLoading({
        type: 'remove',
        projectId
      });

      console.timeEnd(timeMessage);

      // Don't save paginated responses as latest
      if (!query.from) {
        idb.set(`project-deployments-${projectId}`, deployments);
      }
    })
    .catch(error => {
      setLoading({
        type: 'remove',
        projectId
      });

      console.error(`Failed to load deployments: ${error}`);
    });
};
