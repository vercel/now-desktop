import ms from 'ms';
import { API_REGISTRATION } from './endpoints';

const NETWORK_ERR_CODE = 'network_error';
const NETWORK_ERR_MESSAGE = 'A network error has occurred. Please retry';

export default async (path, token = null, opts = {}) => {
  const headers = opts.headers || {};

  // Without a token, there's no need to continue
  if (!token && !path.includes(API_REGISTRATION)) {
    return false;
  }

  headers.Authorization = `bearer ${token}`;
  headers['user-agent'] = 'Now Desktop';

  // Accept path to be a full url or a relative path
  const url = path[0] === '/' ? 'https://zeit.co' + path : path;

  let res;
  let data;
  let error;

  try {
    res = await fetch(url, {
      ...opts,
      headers,
      timeout: ms('20s')
    });

    if (res.status === 403) {
      // We need to log out here
      return false;
    }

    if (res.status === 500) {
      return { error: 'An error has occurred. Please try again' };
    }

    if (opts.throwOnHTTPError && (res.status < 200 || res.status >= 300)) {
      if (res.headers.get('Content-Type') === 'application/json') {
        data = await res.json();
        error = new Error(
          data.error === null ? 'Unexpected Error' : data.error.message
        );
        error.res = res;
        error.status = res.status;

        error.code = data.error === null ? res.status : data.error.code;
      } else {
        throw new Error('A network error occurred');
      }
    } else {
      data = await res.json();
    }
  } catch (error2) {
    error = new Error(NETWORK_ERR_MESSAGE + ` (${url})`);
    error.code = NETWORK_ERR_CODE;
    error.res = null;
    error.status = null;
  }

  if (error) throw error;
  return data;
};
