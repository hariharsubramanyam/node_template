import 'source-map-support/register';
import {BASE_URL, createRequestOptions} from './request_helper';
import {removeDb} from './db_helper';
import requestPromise from 'request-promise';
import {registerUser, registerUser2, ok, sampleUser, sampleUser2, notFound, badRequest, forbidden} from './auth_test';
import {expect} from 'chai';

const connectionUrl = BASE_URL + 'connections/';

function sendConnectionRequest(token, email) {
  const options = createRequestOptions(connectionUrl, 'POST', {}, {email}, token);
  return requestPromise(options);
}

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
