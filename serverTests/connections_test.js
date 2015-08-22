import 'source-map-support/register';
import {BASE_URL, createRequestOptions} from './request_helper';
import {removeDb} from './db_helper';
import requestPromise from 'request-promise';
import {registerUser, registerUser2, ok, sampleUser2} from './auth_test';

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
      let token1 = null;
      return registerUser().then(function onFirstRegister(res) {
        ok(res);
        token1 = res.body.content.token;
        return registerUser2();
      }).then(function onSecondRegister(res) {
        ok(res);
        return sendConnectionRequest(token1, sampleUser2.email);
      }).then(function onConnectionRequest(res) {
        ok(res);
      });
    }); // End it should allow creating a connection request.
  }); // End describe creating.
});
