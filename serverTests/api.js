import 'source-map-support/register';
import request from 'request';

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
    const deleteUserOptions = this.createRequestOptions(this.userUrl(), 'DELETE', {}, {}, token);
    request(deleteUserOptions, function onLoad(err, response) {
      callback(err, response);
    });
  }
  updateUser(token, updates, callback) {
    const updateUserOptions = this.createRequestOptions(this.userUrl(), 'PUT', {}, updates, token);
    request(updateUserOptions, function onLoad(err, response) {
      callback(err, response);
    });
  }
  getUser(token, callback) {
    const getUserOptions = this.createRequestOptions(this.userUrl(), 'GET', {}, {}, token);
    request(getUserOptions, function onLoad(err, response) {
      callback(err, response);
    });
  }
  sendConnectionRequest(token, email, callback) {
    const options = this.createRequestOptions(this.connectionUrl(), 'POST', {}, {email}, token);
    request(options, function onLoad(err, response) {
      callback(err, response);
    });
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
    const registerUserOptions = this.createRequestOptions(this.authUrl(), 'POST', {}, user);
    request(registerUserOptions, function onLoad(err, response) {
      callback(err, response);
    });
  }
  validateToken(bearer, callback) {
    const validateTokenOptions = this.createRequestOptions(this.authUrl(), 'GET', {}, {}, bearer);
    request(validateTokenOptions, function onLoad(err, response) {
      callback(err, response);
    });
  }
  getToken(user, callback) {
    const getTokenOptions = this.createRequestOptions(this.authUrl(), 'PUT', {}, user);
    request(getTokenOptions, function onLoad(err, response) {
      callback(err, response);
    });
  }
}

export default Api;
