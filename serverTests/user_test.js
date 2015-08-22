import 'source-map-support/register';
import {BASE_URL, createRequestOptions} from './request_helper';
import {removeDb} from './db_helper';
import requestPromise from 'request-promise';
import {registerUser, ok, getToken, notFound, sampleUser, badRequest} from './auth_test';
import {expect} from 'chai';

const userUrl = BASE_URL + 'users/me/';

function deleteUser(token) {
  const deleteUserOptions = createRequestOptions(userUrl, 'DELETE', {}, {}, token);
  return requestPromise(deleteUserOptions);
}

function updateUser(token, updates) {
  const updateUserOptions = createRequestOptions(userUrl, 'PUT', {}, updates, token);
  return requestPromise(updateUserOptions);
}

function getUser(token) {
  const getUserOptions = createRequestOptions(userUrl, 'GET', {}, {}, token);
  return requestPromise(getUserOptions);
}

describe('Users', function usersTestSuite() {
  beforeEach(removeDb);
  afterEach(removeDb);

  describe('Deleting', function impl() {
    it('should allow deleting a user who exists', function test() {
      // Register a user, delete the user, and try to login as that user - it should fail.
      return registerUser().then(function onRegister(res) {
        ok(res);
        return deleteUser(res.body.content.token);
      }).then(function onDelete(res) {
        ok(res);
        return getToken();
      }).then(function onLogin(res) {
        notFound(res);
      });
    }); // End it should allow deleting a user who exists.
  }); // End describe deleting.

  describe('Updating', function impl() {
    it('should allow changing phone number and email', function test() {
      // Create a user, change the email and phone number, and ensure that it worked.
      const newPhone = '9999999999';
      const newEmail = 'newemail@newemail.com';
      expect(newEmail).to.not.eql(sampleUser.email);
      expect(newPhone).to.not.eql(sampleUser.phone);

      let tokenValue = null;
      return registerUser().then(function onRegister(res) {
        ok(res);
        tokenValue = res.body.content.token;
        return updateUser(tokenValue, {
          'phone': newPhone,
          'email': newEmail,
        });
      }).then(function onUpdate(res) {
        ok(res);
        return getUser(tokenValue);
      }).then(function onGet(res) {
        ok(res);
        expect(res.body.content.email).to.eql(newEmail);
        expect(res.body.content.phone).to.eql(newPhone);
      });
    }); // End it should allow changing phone number and email.

    it('should not allow illegal changes', function test() {
      const newPhone = 'failure';
      expect(newPhone).to.not.eql(sampleUser.phone);
      let tokenValue = null;
      return registerUser().then(function onRegister(res) {
        ok(res);
        tokenValue = res.body.content.token;
        return updateUser(tokenValue, {
          'phone': newPhone,
        });
      }).then(function onUpdate(res) {
        badRequest(res);
      });
    });
  }); // End describe updating.

  describe('Getting', function impl() {
    it('should allow getting user info', function test() {
      let tokenValue = null;
      return registerUser().then(function onRegister(res) {
        ok(res);
        tokenValue = res.body.content.token;
        return getUser(tokenValue);
      }).then(function onGet(res) {
        ok(res);
        const content = res.body.content;
        expect(content.email).to.eql(sampleUser.email);
        expect(content.phone).to.eql(sampleUser.phone);
        expect(content.name).to.eql(sampleUser.username);
      });
    });
  }); // End describe getting.
});
