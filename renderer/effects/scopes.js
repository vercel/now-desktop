import loadData from '../utils/data/load';
import { API_TEAMS, API_USER } from '../utils/data/endpoints';

export default (config, active, setActive, scopes, setScopes) => {
  if (!config) {
    return;
  }

  const { token, currentTeam } = config;

  loadData(API_TEAMS, token)
    .then(data => {
      if (!data || !data.teams) {
        console.error('Failed to load teams');
        return;
      }

      const scopes = data.teams.map(team => ({
        id: team.id,
        avatar: team.avatar,
        slug: team.slug,
        name: team.name
      }));

      loadData(API_USER, token)
        .then(data => {
          if (!data || !data.user) {
            console.error('Failed to load user');
            return;
          }

          const { user } = data;

          scopes.unshift({
            id: user.uid,
            avatar: user.avatar,
            slug: user.username,
            name: user.name || user.username,
            currentUser: true
          });

          let relatedScope = null;

          if (currentTeam) {
            relatedScope = scopes.find(scope => scope.id === currentTeam);
          }

          // If no current team is defined, fall back to the user
          if (!relatedScope) {
            relatedScope = scopes[0];
          }

          setScopes(scopes);
          setActive(relatedScope);
        })
        .catch(err => {
          console.error(`Failed to load user: ${err}`);
        });
    })
    .catch(err => {
      console.error(`Failed to load teams: ${err}`);
    });
};
