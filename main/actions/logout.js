// Packages
const fetch = require('node-fetch');

// Utilities
const { error: showError } = require('../dialogs');
const { remove: removeConfig, get: getConfig } = require('../utils/config');
const { prepareCache } = require('../api');

const endpoint = 'https://zeit.co/api/www/user/tokens/';

const requestHeaders = token => ({
  headers: {
    Authorization: `bearer ${token}`
  }
});

const getTokenId = async token => {
  let result;

  try {
    result = await fetch(endpoint, requestHeaders(token));
  } catch (err) {
    showError('Could not fetch token id for revoking it on logout', err);
    return;
  }

  const tokenList = await result.json();

  if (!tokenList.tokens) {
    return;
  }

  const tokenInfo = tokenList.tokens.find(t => token === t.token);

  if (!tokenInfo) {
    return;
  }

  return tokenInfo.id;
};

const revokeToken = async (token, tokenId) => {
  const details = {
    method: 'DELETE'
  };

  Object.assign(details, requestHeaders(token));

  let result;

  try {
    result = await fetch(endpoint + encodeURIComponent(tokenId), details);
  } catch (err) {
    showError('Could not revoke token on logout', err);
    return;
  }

  if (!result.ok) {
    console.error('Not able to log out');
  }
};

module.exports = async (app, tutorial) => {
  const offline = process.env.CONNECTION === 'offline';

  // The app shouldn't log out if an error occurs while offline
  // Only do that while online
  if (offline) {
    return;
  }

  // Cache user information
  const userDetails = await getConfig();

  try {
    await removeConfig();
  } catch (err) {
    showError(`Couldn't remove config while logging out`, err);
  }

  const cache = prepareCache();
  const noMoveWanted = cache.has('no-move-wanted');

  // Clear app cache
  cache.clear();

  // Keep user selection of moving the app binary
  if (noMoveWanted) {
    cache.set('no-move-wanted', true);
  }

  if (tutorial) {
    // Prepare the tutorial by reloading its contents
    tutorial.reload();

    // Once the content has loaded again, show it
    tutorial.once('ready-to-show', () => tutorial.show());
  }

  let tokenId;

  try {
    tokenId = await getTokenId(userDetails.token);
  } catch (err) {
    showError('Not able to get token id on logout', err);
    return;
  }

  if (!tokenId) {
    return;
  }

  try {
    await revokeToken(userDetails.token, tokenId);
  } catch (err) {
    showError('Could not revoke token on logout', err);
  }
};
