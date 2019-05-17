import * as idb from 'idb-keyval';
import loadData from '../utils/load';
import { API_TEAMS, API_USER } from '../utils/endpoints';

export default ({ token }, setScopes) => {
  console.time('Loaded fresh user and teams');

  idb.get('last-scopes').then(lastScopes => {
    if (lastScopes) {
      setScopes(lastScopes);

      idb.set('last-scopes', null);
    }
  });

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

          scopes.sort((a, b) => {
            if (a.slug < b.slug) return -1;
            if (a.slug > b.slug) return 1;

            return 0;
          });

          scopes.unshift({
            id: user.uid,
            avatar: user.avatar,
            slug: user.username,
            name: user.name || user.username,
            isCurrentUser: true
          });

          console.timeEnd('Loaded fresh user and teams');

          setScopes(scopes);

          idb.set('last-scopes', scopes);
        })
        .catch(err => {
          console.error(`Failed to load user: ${err}`);
        });
    })
    .catch(err => {
      console.error(`Failed to load teams: ${err}`);
    });
};
