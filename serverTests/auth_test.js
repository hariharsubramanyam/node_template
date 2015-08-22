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

function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function deleteDb(done) {
  removeDb(done);
}

describe('Authentication', function auth() {
  beforeEach(deleteDb);
  afterEach(deleteDb);

  describe('Registering', function describeImpl() {
    it('should allow registering', function test() {
      const requestOptions = createRequestOptions(authUrl, 'POST', {}, sampleUser);
      // Register a user and ensure we get a token for the user.
      return requestPromise(requestOptions).then(function onRegister(res) {
        expect(res.statusCode).to.eql(HttpStatus.OK);
        expect(res.body.success).to.be.true;
        expect(res.body.content.name).to.eql(sampleUser.username);
        expect(res.body.content.token).to.be.a('string');
      });
    }); // End it should allow registering.

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
        const copiedUser = copy(sampleUser);
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
  }); // End describe registering.

  describe('Getting token', function impl() {
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
        expect(res.body.content.name).to.eql(sampleUser.username);
      });
    }); // End it should allow getting a token.

    it('should not give token for invalid user', function test() {
      // Try to get a token for a user who doesn't exist and ensure that we get a 404.
      const fakeUserOptions = createRequestOptions(authUrl, 'PUT', {}, copy(sampleUser));
      return requestPromise(fakeUserOptions).then(function onRegister(res) {
        expect(res.statusCode).to.eql(HttpStatus.NOT_FOUND);
      });
    });

    it('should change the token when we fetch twice', function test() {
      // Create a user and check the token. Then fetch a new token and ensure that the token value
      // is different.
      let tokenValue = null;
      const registerUserOptions = createRequestOptions(authUrl, 'POST', {}, sampleUser);
      return requestPromise(registerUserOptions).then(function onRegister(res) {
        expect(res.statusCode).to.eql(HttpStatus.OK);
        expect(res.body.success).to.be.true;
        expect(res.body.content.token).to.be.a('string');
        tokenValue = res.body.content.token;
        const getTokenOptions = createRequestOptions(authUrl, 'PUT', {}, sampleUser);
        return requestPromise(getTokenOptions);
      }).then(function onToken(res) {
        expect(res.statusCode).to.eql(HttpStatus.OK);
        expect(res.body.success).to.be.true;
        expect(res.body.content.token).to.be.a('string');
        expect(tokenValue).to.be.a('string');
        expect(res.body.content.token).to.not.eql(tokenValue);
      });
    });

    it('should eliminate old token when we get a new one', function test() {
      let tokenValue = null;
      const registerUserOptions = createRequestOptions(authUrl, 'POST', {}, sampleUser);
      return requestPromise(registerUserOptions).then(function onRegister(res) {
        tokenValue = res.body.content.token;
        const getTokenOptions = createRequestOptions(authUrl, 'PUT', {}, sampleUser);
        return requestPromise(getTokenOptions);
      }).then(function onToken(res) {
        expect(res.body.content.token).to.not.eql(tokenValue);
        const validateTokenOptions = createRequestOptions(
            authUrl,
            'GET',
            {},
            sampleUser,
            tokenValue);
        return requestPromise(validateTokenOptions);
      }).then(function onValidate(res) {
        expect(res.statusCode).to.eql(HttpStatus.UNAUTHORIZED);
      });
    }); // End it should eliminate old token when we get a new one.
  }); // End describe getting token.

  describe('Validating token', function impl() {
    it('should validate tokens', function test() {
      let tokenValue = null;
      const registerUserOptions = createRequestOptions(authUrl, 'POST', {}, sampleUser);
      return requestPromise(registerUserOptions).then(function onRegister(res) {
        tokenValue = res.body.content.token;
        const validateTokenOptions = createRequestOptions(
            authUrl,
            'GET',
            {},
            sampleUser,
            tokenValue);
        return requestPromise(validateTokenOptions);
      }).then(function onToken(res) {
        expect(res.statusCode).to.eql(HttpStatus.OK);
      });
    });
  }); // End describe validating token.
});
