import 'source-map-support/register';

export const BASE_URL = 'http://localhost:3000/api/v1/';

export function createRequestOptions(url, method, headers, body, token) {
  const result = {
    url,
    method,
    body,
    headers,
    'json': true,
    'simple': false,
    'resolveWithFullResponse': true,
  };
  if (token !== undefined) {
    result.auth = {
      'bearer': token,
      'sendImmediately': true,
    };
  }
  return result;
}
