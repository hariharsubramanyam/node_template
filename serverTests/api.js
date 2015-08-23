import 'source-map-support/register';
import request from 'request';

function requestHelper(options, callback) {
  request(options,
      function onLoad(err, res) {
        callback(err, res);
      });
}

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
  deleteUser(token, callback) {
    const options = this.createRequestOptions(this.userUrl(), 'DELETE', {}, {}, token);
    requestHelper(options, callback);
  }
  updateUser(token, updates, callback) {
    const options = this.createRequestOptions(this.userUrl(), 'PUT', {}, updates, token);
    requestHelper(options, callback);
  }
  getUser(token, callback) {
    const options = this.createRequestOptions(this.userUrl(), 'GET', {}, {}, token);
    requestHelper(options, callback);
  }
  sendConnectionRequest(token, email, callback) {
    const options = this.createRequestOptions(this.connectionUrl(), 'POST', {}, {email}, token);
    requestHelper(options, callback);
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
  registerUser(user, callback) {
    const options = this.createRequestOptions(this.authUrl(), 'POST', {}, user);
    requestHelper(options, callback);
  }
  validateToken(bearer, callback) {
    const options = this.createRequestOptions(this.authUrl(), 'GET', {}, {}, bearer);
    requestHelper(options, callback);
  }
  getToken(user, callback) {
    const options = this.createRequestOptions(this.authUrl(), 'PUT', {}, user);
    requestHelper(options, callback);
  }
}

export default Api;
