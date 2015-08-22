import 'source-map-support/register';
import {expect} from 'chai';
import {BASE_URL, createRequestOptions} from './request_helper';
import HttpStatus from 'http-status-codes';
import {removeDb} from './db_helper';
import requestPromise from 'request-promise';

const authUrl = BASE_URL + 'auth/token/';

const sampleUser = {
  'username': 'testuser',
  'password': 'testpassword',
  'phone': '1112223333',
  'email': 'testuser@test.com',
};

describe('Authentication', function auth() {
  beforeEach(function beforeFunc(done) {
    removeDb(function cb() {
      done();
    });
  }); // End beforeEach.

  it('should not allow registering twice', function test() {
    const requestOptions = createRequestOptions(authUrl, 'POST', {}, sampleUser);
    return requestPromise(requestOptions).then(function onFirstRegister(res) {
      expect(res.statusCode).to.eql(HttpStatus.OK);
      return requestPromise(requestOptions);
    }).then(function onSecondRegister(res) {
      expect(res.statusCode).to.eql(HttpStatus.FORBIDDEN);
    });
  }); // End it should not allow registering twice.

  it('should not allow missing arguments when registering', function test() {
    function createMissingOptions(key) {
      const copiedUser = JSON.parse(JSON.stringify(sampleUser));
      copiedUser[key] = undefined;
      return createRequestOptions(authUrl, 'POST', {}, copiedUser);
    }

    // Remove the fields one at a time and ensure that the request fails.
    // Then, remove a fake field and ensure that the request works.
    return requestPromise(createMissingOptions('username')).then(function onMissingUsername(res) {
      expect(res.statusCode).to.eql(HttpStatus.BAD_REQUEST);
      return requestPromise(createMissingOptions('email'));
    }).then(function onMissingEmail(res) {
      expect(res.statusCode).to.eql(HttpStatus.BAD_REQUEST);
      return requestPromise(createMissingOptions('phone'));
    }).then(function onMissingPhone(res) {
      expect(res.statusCode).to.eql(HttpStatus.BAD_REQUEST);
      return requestPromise(createMissingOptions('password'));
    }).then(function onMissingPassword(res) {
      expect(res.statusCode).to.eql(HttpStatus.BAD_REQUEST);
      return requestPromise(createMissingOptions('fakeProperty'));
    }).then(function onMissingFakeProperty(res) {
      expect(res.statusCode).to.eql(HttpStatus.OK);
    });
  }); // End it should not allow missing arguments when registering.

  it('should allow getting a token', function test() {
    // Create a new user.
    const registerUserOptions = createRequestOptions(authUrl, 'POST', {}, sampleUser);
    return requestPromise(registerUserOptions).then(function onRegister(res) {
      expect(res.statusCode).to.eql(HttpStatus.OK);
      // Get a token.
      const getTokenOptions = createRequestOptions(authUrl, 'PUT', {}, sampleUser);
      return requestPromise(getTokenOptions);
    }).then(function onToken(res) {
      expect(res.statusCode).to.eql(HttpStatus.OK);
      expect(res.body.success).to.be.true;
      expect(res.body.content.token).to.be.a('string');
      expect(res.body.content.username).to.eql(sampleUser.username);
    });
  });
});
