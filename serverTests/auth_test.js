import 'source-map-support/register';
import {expect} from 'chai';
import {authUrl, createRequestOptions, sampleUser, copy, registerUser, validateToken, getToken} from './request_helper';
import {ok, unauthorized, notFound, badRequest, forbidden, tokenIsString} from './expect_helper';
import {removeDb} from './db_helper';
import requestPromise from 'request-promise';

describe('Authentication', function auth() {
  beforeEach(removeDb);
  afterEach(removeDb);

  describe('Registering', function describeImpl() {
    it('should allow registering', function test() {
      // Register a user and ensure we get a token for the user.
      return registerUser().then(function onRegister(res) {
        tokenIsString(ok(res));
        expect(res.body.content.name).to.eql(sampleUser.username);
      });
    }); // End it should allow registering.

    it('should not allow registering twice', function test() {
      return registerUser().then(function onFirstRegister(res) {
        ok(res);
        return registerUser();
      }).then(function onSecondRegister(res) {
        forbidden(res);
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
        badRequest(res);
        return requestPromise(createMissingOptions('email'));
      }).then(function onMissingEmail(res) {
        badRequest(res);
        return requestPromise(createMissingOptions('phone'));
      }).then(function onMissingPhone(res) {
        badRequest(res);
        return requestPromise(createMissingOptions('password'));
      }).then(function onMissingPassword(res) {
        badRequest(res);
        return requestPromise(createMissingOptions('fakeProperty'));
      }).then(function onMissingFakeProperty(res) {
        ok(res);
      });
    }); // End it should not allow missing arguments when registering.
  }); // End describe registering.

  describe('Getting token', function impl() {
    it('should allow getting a token', function test() {
      // Create a new user.
      return registerUser().then(function onRegister(res) {
        ok(res);
        // Get a token.
        return getToken();
      }).then(function onToken(res) {
        tokenIsString(ok(res));
        expect(res.body.content.name).to.eql(sampleUser.username);
      });
    }); // End it should allow getting a token.

    it('should not give token for invalid user', function test() {
      // Try to get a token for a user who doesn't exist and ensure that we get a 404.
      return getToken().then(function onRegister(res) {
        notFound(res);
      });
    });

    it('should change the token when we fetch twice', function test() {
      // Create a user and check the token. Then fetch a new token and ensure that the token value
      // is different.
      let tokenValue = null;
      return registerUser().then(function onRegister(res) {
        tokenIsString(ok(res));
        tokenValue = res.body.content.token;
        return getToken();
      }).then(function onToken(res) {
        tokenIsString(ok(res));
        expect(tokenValue).to.be.a('string');
        expect(res.body.content.token).to.not.eql(tokenValue);
      });
    });

    it('should eliminate old token when we get a new one', function test() {
      let tokenValue = null;
      return registerUser().then(function onRegister(res) {
        tokenValue = res.body.content.token;
        return getToken();
      }).then(function onToken(res) {
        expect(res.body.content.token).to.not.eql(tokenValue);
        return validateToken(tokenValue);
      }).then(function onValidate(res) {
        unauthorized(res);
      });
    }); // End it should eliminate old token when we get a new one.
  }); // End describe getting token.

  describe('Validating token', function impl() {
    it('should validate tokens', function test() {
      return registerUser().then(function onRegister(res) {
        return validateToken(res.body.content.token);
      }).then(function onToken(res) {
        ok(res);
      });
    }); // End it should validate tokens.

    it('should not validate nonsense', function test() {
      return validateToken('nonsense').then(function onValidate(res) {
        unauthorized(res);
      });
    }); // End it should not validate nonsense.

    it('should not validate expired token', function test() {
      let tokenValue = null;
      return registerUser().then(function onRegister(res) {
        tokenIsString(ok(res));
        tokenValue = res.body.content.token;
        return getToken();
      }).then(function onToken(res) {
        tokenIsString(ok(res));
        expect(tokenValue).to.not.eql(res.body.content.token);
        return validateToken(tokenValue);
      }).then(function onValidate(res) {
        unauthorized(res);
      });
    }); // End it should not validate expired token.
  }); // End describe validating token.
});
