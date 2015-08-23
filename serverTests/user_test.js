import 'source-map-support/register';
import {removeDb, BASE_URL} from './db_helper';
import statusHelper from './status_helper';
import Api from './api';
import {expect} from 'chai';
import Promise from 'bluebird';

const api = new Api(BASE_URL);
Promise.promisifyAll(api);

describe('Users', function usersTestSuite() {
  beforeEach(removeDb);
  afterEach(removeDb);

  describe('Deleting', function impl() {
    it('should allow deleting a user who exists', function test() {
      // Register a user, delete the user, and try to login as that user - it should fail.
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onRegister(res) {
        statusHelper.ok(res);
        return api.deleteUserAsync(res.body.content.token);
      }).then(function onDelete(res) {
        statusHelper.ok(res);
        return api.getTokenAsync(api.makeSampleUserOne());
      }).then(function onLogin(res) {
        statusHelper.notFound(res);
      });
    }); // End it should allow deleting a user who exists.
  }); // End describe deleting.

  describe('Updating', function impl() {
    it('should allow changing phone number and name', function test() {
      // Create a user, change the name and phone number, and ensure that it worked.
      const newPhone = '9999999999';
      const newName = 'the new name';
      expect(newName).to.not.eql(api.makeSampleUserOne().name);
      expect(newPhone).to.not.eql(api.makeSampleUserOne().phone);

      let tokenValue = null;
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onRegister(res) {
        statusHelper.ok(res);
        tokenValue = res.body.content.token;
        return api.updateUserAsync(tokenValue, {
          'phone': newPhone,
          'name': newName,
        });
      }).then(function onUpdate(res) {
        statusHelper.ok(res);
        return api.getUserAsync(tokenValue);
      }).then(function onGet(res) {
        statusHelper.ok(res);
        expect(res.body.content.name).to.eql(newName);
        expect(res.body.content.phone).to.eql(newPhone);
      });
    }); // End it should allow changing phone number and name.

    it('should not allow illegal changes', function test() {
      const newPhone = 'failure';
      expect(newPhone).to.not.eql(api.makeSampleUserOne().phone);
      let tokenValue = null;
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onRegister(res) {
        statusHelper.ok(res);
        tokenValue = res.body.content.token;
        return api.updateUserAsync(tokenValue, {
          'phone': newPhone,
        });
      }).then(function onUpdate(res) {
        statusHelper.badRequest(res);
      });
    });
  }); // End describe updating.

  describe('Getting', function impl() {
    it('should allow getting user info', function test() {
      let tokenValue = null;
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onRegister(res) {
        statusHelper.ok(res);
        tokenValue = res.body.content.token;
        return api.getUserAsync(tokenValue);
      }).then(function onGet(res) {
        statusHelper.ok(res);
        const content = res.body.content;
        expect(content.email).to.eql(api.makeSampleUserOne().email);
        expect(content.phone).to.eql(api.makeSampleUserOne().phone);
        expect(content.name).to.eql(api.makeSampleUserOne().username);
      });
    }); // End it should allow getting user info.
  }); // End describe getting.
});
