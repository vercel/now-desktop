const fetch = require('node-fetch');
const { getConfig } = require('./config');

const API_USER_TOKENS = 'https://api.zeit.co/user/tokens';

module.exports = async function() {
  try {
    const { token } = await getConfig();

    const res = await fetch(`${API_USER_TOKENS}/current`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const { tokenId } = await res.json();

    if (!tokenId) {
      throw new Error('Unable to log out');
    }

    return;
  } catch (error) {
    console.error(error);
  }
};
