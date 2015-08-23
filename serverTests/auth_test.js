import 'source-map-support/register';
import {expect} from 'chai';
import Api from './api';
import {ok, unauthorized, notFound, badRequest, forbidden} from './status_helper';
import {removeDb, BASE_URL} from './db_helper';
import requestPromise from 'request-promise';

const api = new Api(BASE_URL);

function tokenIsString(res) {
  expect(res.body.content.token).to.be.a('string');
  expect(res.body.content.token.length).to.be.above(0);
  return res;
}

describe('Authentication', function auth() {
  beforeEach(removeDb);
  afterEach(removeDb);

  describe('Registering', function describeImpl() {
    it('should allow registering', function test() {
      // Register a user and ensure we get a token for the user.
      return api.registerUser(api.makeSampleUserOne()).then(function onRegister(res) {
        tokenIsString(ok(res));
        expect(res.body.content.name).to.eql(api.makeSampleUserOne().username);
      });
    }); // End it should allow registering.

    it('should not allow registering twice', function test() {
      return api.registerUser(api.makeSampleUserOne()).then(function onFirstRegister(res) {
        ok(res);
        return api.registerUser(api.makeSampleUserOne());
      }).then(function onSecondRegister(res) {
        forbidden(res);
      });
    }); // End it should not allow registering twice.

    it('should not allow missing arguments when registering', function test() {
      function createMissingOptions(key) {
        const copiedUser = api.makeSampleUserOne();
        copiedUser[key] = undefined;
        return api.createRequestOptions(api.authUrl(), 'POST', {}, copiedUser);
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
      return api.registerUser(api.makeSampleUserOne()).then(function onRegister(res) {
        ok(res);
        // Get a token.
        return api.getToken(api.makeSampleUserOne());
      }).then(function onToken(res) {
        tokenIsString(ok(res));
        expect(res.body.content.name).to.eql(api.makeSampleUserOne().username);
      });
    }); // End it should allow getting a token.

    it('should not give token for invalid user', function test() {
      // Try to get a token for a user who doesn't exist and ensure that we get a 404.
      return api.getToken(api.makeSampleUserOne()).then(function onRegister(res) {
        notFound(res);
      });
    });

    it('should change the token when we fetch twice', function test() {
      // Create a user and check the token. Then fetch a new token and ensure that the token value
      // is different.
      let tokenValue = null;
      return api.registerUser(api.makeSampleUserOne()).then(function onRegister(res) {
        tokenIsString(ok(res));
        tokenValue = res.body.content.token;
        return api.getToken(api.makeSampleUserOne());
      }).then(function onToken(res) {
        tokenIsString(ok(res));
        expect(tokenValue).to.be.a('string');
        expect(res.body.content.token).to.not.eql(tokenValue);
      });
    });

    it('should eliminate old token when we get a new one', function test() {
      let tokenValue = null;
      return api.registerUser(api.makeSampleUserOne()).then(function onRegister(res) {
        tokenValue = res.body.content.token;
        return api.getToken(api.makeSampleUserOne());
      }).then(function onToken(res) {
        expect(res.body.content.token).to.not.eql(tokenValue);
        return api.validateToken(tokenValue);
      }).then(function onValidate(res) {
        unauthorized(res);
      });
    }); // End it should eliminate old token when we get a new one.
  }); // End describe getting token.

  describe('Validating token', function impl() {
    it('should validate tokens', function test() {
      return api.registerUser(api.makeSampleUserOne()).then(function onRegister(res) {
        return api.validateToken(res.body.content.token);
      }).then(function onToken(res) {
        ok(res);
      });
    }); // End it should validate tokens.

    it('should not validate nonsense', function test() {
      return api.validateToken('nonsense').then(function onValidate(res) {
        unauthorized(res);
      });
    }); // End it should not validate nonsense.

    it('should not validate expired token', function test() {
      let tokenValue = null;
      return api.registerUser(api.makeSampleUserOne()).then(function onRegister(res) {
        tokenIsString(ok(res));
        tokenValue = res.body.content.token;
        return api.getToken(api.makeSampleUserOne());
      }).then(function onToken(res) {
        tokenIsString(ok(res));
        expect(tokenValue).to.not.eql(res.body.content.token);
        return api.validateToken(tokenValue);
      }).then(function onValidate(res) {
        unauthorized(res);
      });
    }); // End it should not validate expired token.
  }); // End describe validating token.
});
