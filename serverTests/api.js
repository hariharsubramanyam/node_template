import 'source-map-support/register';
import requestPromise from 'request-promise';

class Api {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  authUrl() {
    return this.baseUrl + 'auth/token/';
  }
  connectionUrl() {
    return this.baseUrl + 'connections/';
  }
  userUrl() {
    return this.baseUrl + 'users/me/';
  }
  createRequestOptions(url, method, headers, body, token) {
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
  deleteUser(token) {
    const deleteUserOptions = this.createRequestOptions(this.userUrl(), 'DELETE', {}, {}, token);
    return requestPromise(deleteUserOptions);
  }
  updateUser(token, updates) {
    const updateUserOptions = this.createRequestOptions(this.userUrl(), 'PUT', {}, updates, token);
    return requestPromise(updateUserOptions);
  }
  getUser(token) {
    const getUserOptions = this.createRequestOptions(this.userUrl(), 'GET', {}, {}, token);
    return requestPromise(getUserOptions);
  }
  sendConnectionRequest(token, email) {
    const options = this.createRequestOptions(this.connectionUrl(), 'POST', {}, {email}, token);
    return requestPromise(options);
  }
  makeSampleUserOne() {
    return {
      'username': 'testuser',
      'password': 'testpassword',
      'phone': '1112223333',
      'email': 'testuser@test.com',
    };
  }
  makeSampleUserTwo() {
    return {
      'username': 'testusertwo',
      'password': 'testpassword2',
      'phone': '1112223344',
      'email': 'testuser2@test.com',
    };
  }
  registerUser(user) {
    const registerUserOptions = this.createRequestOptions(this.authUrl(), 'POST', {}, user);
    return requestPromise(registerUserOptions);
  }
  validateToken(bearer) {
    const validateTokenOptions = this.createRequestOptions(this.authUrl(), 'GET', {}, {}, bearer);
    return requestPromise(validateTokenOptions);
  }
  getToken(user) {
    const getTokenOptions = this.createRequestOptions(this.authUrl(), 'PUT', {}, user);
    return requestPromise(getTokenOptions);
  }
}

export default Api;
