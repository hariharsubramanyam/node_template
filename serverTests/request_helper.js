import 'source-map-support/register';
import requestPromise from 'request-promise';

const BASE_URL = 'http://localhost:3000/api/v1/';
export const authUrl = BASE_URL + 'auth/token/';
export const connectionUrl = BASE_URL + 'connections/';
export const userUrl = BASE_URL + 'users/me/';

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

export function deleteUser(token) {
  const deleteUserOptions = createRequestOptions(userUrl, 'DELETE', {}, {}, token);
  return requestPromise(deleteUserOptions);
}

export function updateUser(token, updates) {
  const updateUserOptions = createRequestOptions(userUrl, 'PUT', {}, updates, token);
  return requestPromise(updateUserOptions);
}

export function getUser(token) {
  const getUserOptions = createRequestOptions(userUrl, 'GET', {}, {}, token);
  return requestPromise(getUserOptions);
}

export function sendConnectionRequest(token, email) {
  const options = createRequestOptions(connectionUrl, 'POST', {}, {email}, token);
  return requestPromise(options);
}


export const sampleUser = {
  'username': 'testuser',
  'password': 'testpassword',
  'phone': '1112223333',
  'email': 'testuser@test.com',
};

export const sampleUser2 = {
  'username': 'testusertwo',
  'password': 'testpassword2',
  'phone': '1112223344',
  'email': 'testuser2@test.com',
};

export function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function registerUserHelper(user) {
  const registerUserOptions = createRequestOptions(authUrl, 'POST', {}, user);
  return requestPromise(registerUserOptions);
}

export function registerUser() {
  return registerUserHelper(sampleUser);
}

export function registerUser2() {
  return registerUserHelper(sampleUser2);
}

export function validateToken(bearer) {
  const validateTokenOptions = createRequestOptions(authUrl, 'GET', {}, {}, bearer);
  return requestPromise(validateTokenOptions);
}

export function getToken() {
  const getTokenOptions = createRequestOptions(authUrl, 'PUT', {}, sampleUser);
  return requestPromise(getTokenOptions);
}
