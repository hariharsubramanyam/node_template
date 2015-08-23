import 'source-map-support/register';
import {removeDb, BASE_URL} from './db_helper';
import Api from './api';
import {ok, notFound, badRequest, forbidden} from './status_helper';
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
        ok(res);
        token = res.body.content.token;
        return api.registerUserAsync(api.makeSampleUserTwo());
      }).then(function onSecondRegister(res) {
        ok(res);
        return api.sendConnectionRequestAsync(token, api.makeSampleUserTwo().email);
      }).then(function onConnectionRequest(res) {
        ok(res);
        expect(res.body.content.sender).to.eql(api.makeSampleUserOne().email);
        expect(res.body.content.recipient).to.eql(api.makeSampleUserTwo().email);
      });
    }); // End it should allow creating a connection request.

    it('should not allow sending to a user who does not exist', function test() {
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onFirstRegister(res) {
        ok(res);
        return api.sendConnectionRequestAsync(res.body.content.token, 'fakemail@notreal.com');
      }).then(function onConnectionRequest(res) {
        notFound(res);
      });
    }); // End it should not allow sending to a user who does not exist.

    it('should not allow sending to self', function test() {
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onFirstRegister(res) {
        ok(res);
        return api.sendConnectionRequestAsync(res.body.content.token, api.makeSampleUserOne().email);
      }).then(function onConnectionRequest(res) {
        badRequest(res);
      });
    }); // End it should not allow sending to self.

    it('should not allow sending duplicate connection request', function test() {
      let token = null;
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onFirstRegister(res) {
        ok(res);
        token = res.body.content.token;
        return api.registerUserAsync(api.makeSampleUserTwo());
      }).then(function onSecondRegister(res) {
        ok(res);
        return api.sendConnectionRequestAsync(token, api.makeSampleUserTwo().email);
      }).then(function onConnectionRequest(res) {
        ok(res);
        return api.sendConnectionRequestAsync(token, api.makeSampleUserTwo().email);
      }).then(function onSecondConnectionRequest(res) {
        forbidden(res);
      });
    });
  }); // End describe creating.
});
