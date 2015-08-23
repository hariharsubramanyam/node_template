import 'source-map-support/register';
import {removeDb, BASE_URL} from './db_helper';
import Api from './api';
import statusHelper from './status_helper';
import {expect} from 'chai';
import Promise from 'bluebird';

const api = new Api(BASE_URL);
Promise.promisifyAll(api);

describe('Connections', function connectionsTestSuite() {
  beforeEach(removeDb);
  afterEach(removeDb);

  describe('Creating', function impl() {
    it('should allow creating a connection request', function test() {
      // Create two users and send a connection request from the first to the second.
      let token = null;
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onFirstRegister(res) {
        statusHelper.ok(res);
        token = res.body.content.token;
        return api.registerUserAsync(api.makeSampleUserTwo());
      }).then(function onSecondRegister(res) {
        statusHelper.ok(res);
        return api.sendConnectionRequestAsync(token, api.makeSampleUserTwo().email);
      }).then(function onConnectionRequest(res) {
        statusHelper.ok(res);
        expect(res.body.content.sender).to.eql(api.makeSampleUserOne().email);
        expect(res.body.content.recipient).to.eql(api.makeSampleUserTwo().email);
      });
    }); // End it should allow creating a connection request.

    it('should not allow sending to a user who does not exist', function test() {
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onFirstRegister(res) {
        statusHelper.ok(res);
        return api.sendConnectionRequestAsync(res.body.content.token, 'fakemail@notreal.com');
      }).then(function onConnectionRequest(res) {
        statusHelper.notFound(res);
      });
    }); // End it should not allow sending to a user who does not exist.

    it('should not allow sending to self', function test() {
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onFirstRegister(res) {
        statusHelper.ok(res);
        return api.sendConnectionRequestAsync(res.body.content.token, api.makeSampleUserOne().email);
      }).then(function onConnectionRequest(res) {
        statusHelper.badRequest(res);
      });
    }); // End it should not allow sending to self.

    it('should not allow sending duplicate connection request', function test() {
      let token = null;
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onFirstRegister(res) {
        statusHelper.ok(res);
        token = res.body.content.token;
        return api.registerUserAsync(api.makeSampleUserTwo());
      }).then(function onSecondRegister(res) {
        statusHelper.ok(res);
        return api.sendConnectionRequestAsync(token, api.makeSampleUserTwo().email);
      }).then(function onConnectionRequest(res) {
        statusHelper.ok(res);
        return api.sendConnectionRequestAsync(token, api.makeSampleUserTwo().email);
      }).then(function onSecondConnectionRequest(res) {
        statusHelper.forbidden(res);
      });
    });
  }); // End describe creating.

  describe('Getting', function impl() {
    it('should allow getting connections', function test() {
      let token = null;
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onFirstRegister(res) {
        statusHelper.ok(res);
        token = res.body.content.token;
        return api.registerUserAsync(api.makeSampleUserTwo());
      }).then(function onSecondRegister(res) {
        statusHelper.ok(res);
        return api.sendConnectionRequestAsync(token, api.makeSampleUserTwo().email);
      }).then(function onConnectionRequest(res) {
        statusHelper.ok(res);
        return api.getConnectionsAsync(token);
      }).then(function onGotConnections(res) {
        statusHelper.ok(res);
        const content = res.body.content;
        expect(content.length).to.eql(1);
        expect(content[0].sender).to.eql(api.makeSampleUserOne().email);
        expect(content[0].recipient).to.eql(api.makeSampleUserTwo().email);
        expect(content[0].accepted).to.be.false;
      });
    }); // End it should allow getting connections.
  }); // End describe getting.
});
