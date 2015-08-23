import 'source-map-support/register';
import {removeDb} from './db_helper';
import {ok, notFound, badRequest, forbidden} from './status_helper';
import {sendConnectionRequest, registerUser, registerUser2, sampleUser, sampleUser2} from './request_helper';
import {expect} from 'chai';

describe('Connections', function connectionsTestSuite() {
  beforeEach(removeDb);
  afterEach(removeDb);

  describe('Creating', function impl() {
    it('should allow creating a connection request', function test() {
      // Create two users and send a connection request from the first to the second.
      let token = null;
      return registerUser().then(function onFirstRegister(res) {
        ok(res);
        token = res.body.content.token;
        return registerUser2();
      }).then(function onSecondRegister(res) {
        ok(res);
        return sendConnectionRequest(token, sampleUser2.email);
      }).then(function onConnectionRequest(res) {
        ok(res);
        expect(res.body.content.sender).to.eql(sampleUser.email);
        expect(res.body.content.recipient).to.eql(sampleUser2.email);
      });
    }); // End it should allow creating a connection request.

    it('should not allow sending to a user who does not exist', function test() {
      return registerUser().then(function onFirstRegister(res) {
        ok(res);
        return sendConnectionRequest(res.body.content.token, 'fakemail@notreal.com');
      }).then(function onConnectionRequest(res) {
        notFound(res);
      });
    }); // End it should not allow sending to a user who does not exist.

    it('should not allow sending to self', function test() {
      return registerUser().then(function onFirstRegister(res) {
        ok(res);
        return sendConnectionRequest(res.body.content.token, sampleUser.email);
      }).then(function onConnectionRequest(res) {
        badRequest(res);
      });
    }); // End it should not allow sending to self.

    it('should not allow sending duplicate connection request', function test() {
      let token = null;
      return registerUser().then(function onFirstRegister(res) {
        ok(res);
        token = res.body.content.token;
        return registerUser2();
      }).then(function onSecondRegister(res) {
        ok(res);
        return sendConnectionRequest(token, sampleUser2.email);
      }).then(function onConnectionRequest(res) {
        ok(res);
        return sendConnectionRequest(token, sampleUser2.email);
      }).then(function onSecondConnectionRequest(res) {
        forbidden(res);
      });
    });
  }); // End describe creating.
});
