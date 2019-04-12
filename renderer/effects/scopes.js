import loadData from '../utils/data/load';
import { API_TEAMS, API_USER } from '../utils/data/endpoints';

export default ({ token }, setScopes) => {
  console.time('Loaded fresh user and teams');

  loadData(API_TEAMS, token)
    .then(data => {
      if (!data || !data.teams) {
        console.error(`Failed to load teams: ${data}`);
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
            isCurrentUser: true
          });

          console.timeEnd('Loaded fresh user and teams');

          setScopes(scopes);
        })
        .catch(err => {
          console.error(`Failed to load user: ${err}`);
        });
    })
    .catch(err => {
      console.error(`Failed to load teams: ${err}`);
    });
};
