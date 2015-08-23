import 'source-map-support/register';
import {BASE_URL, createRequestOptions} from './request_helper';
import {removeDb} from './db_helper';
import requestPromise from 'request-promise';
import {registerUser, registerUser2, ok, sampleUser2, notFound} from './auth_test';

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
  }); // End describe creating.
});
