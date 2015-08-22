import 'source-map-support/register';

export const BASE_URL = 'http://localhost:3000/api/v1/';

export function createRequestOptions(url, method, headers, body) {
  return {
    url,
    method,
    body,
    'json': true,
    'simple': false,
    'resolveWithFullResponse': true,
  };
}
