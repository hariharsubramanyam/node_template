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

    it('should return no connection requests when there are none', function test() {
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onFirstRegister(res) {
        statusHelper.ok(res);
        return api.getConnectionsAsync(res.body.content.token);
      }).then(function onGotConnections(res) {
        statusHelper.ok(res);
        expect(res.body.content.length).to.eql(0);
      });
    }); // End it should return no connection requests when there are none.
  }); // End describe getting.

  describe('Accepting', function impl() {
    it('should allow accepting connection requests', function test() {
      let tokenOne = null;
      let tokenTwo = null;
      let connectionRequestId = null;
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onFirstRegister(res) {
        statusHelper.ok(res);
        tokenOne = res.body.content.token;
        return api.registerUserAsync(api.makeSampleUserTwo());
      }).then(function onSecondRegister(res) {
        statusHelper.ok(res);
        tokenTwo = res.body.content.token;
        return api.sendConnectionRequestAsync(tokenOne, api.makeSampleUserTwo().email);
      }).then(function onSentConnection(res) {
        statusHelper.ok(res);
        connectionRequestId = res.body.content.id;
        expect(connectionRequestId).to.be.a('string');
        expect(res.body.content.accepted).to.be.false;
        expect(connectionRequestId.length).to.be.above(0);
        return api.getConnectionsAsync(tokenTwo);
      }).then(function onGotConnections(res) {
        statusHelper.ok(res);
        const conns = res.body.content;
        expect(conns.length).to.eql(1);
        expect(conns[0].id).to.eql(connectionRequestId);
        expect(conns[0].accepted).to.be.false;
        return api.acceptConnectionRequestAsync(tokenTwo, connectionRequestId);
      }).then(function onAccepted(res) {
        statusHelper.ok(res);
        return api.getConnectionsAsync(tokenOne);
      }).then(function onGotConnections(res) {
        statusHelper.ok(res);
        const conns = res.body.content;
        expect(conns.length).to.eql(1);
        expect(conns[0].id).to.eql(connectionRequestId);
        expect(conns[0].accepted).to.be.true;
      });
    }); // End it should allow accepting connection requests.

    it('should not allow non-recipient to accept connection request', function test() {
      let tokenOne = null;
      let tokenTwo = null;
      let tokenThree = null;
      let requestId = null;
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onFirstRegister(res) {
        statusHelper.ok(res);
        tokenOne = res.body.content.token;
        return api.registerUserAsync(api.makeSampleUserTwo());
      }).then(function onSecondRegister(res) {
        statusHelper.ok(res);
        tokenTwo = res.body.content.token;
        return api.registerUserAsync(api.makeSampleUserThree());
      }).then(function onThirdUser(res) {
        statusHelper.ok(res);
        tokenThree = res.body.content.token;
        return api.sendConnectionRequestAsync(tokenOne, api.makeSampleUserTwo().email);
      }).then(function onConnectionRequest(res) {
        statusHelper.ok(res);
        requestId = res.body.content.id;
        return api.acceptConnectionRequestAsync(tokenOne, requestId);
      }).then(function onFirstAccept(res) {
        statusHelper.forbidden(res);
        return api.acceptConnectionRequestAsync(tokenThree, requestId);
      }).then(function onSecondAccept(res) {
        statusHelper.forbidden(res);
        return api.acceptConnectionRequestAsync(tokenTwo, requestId);
      }).then(function onThirdAccept(res) {
        statusHelper.ok(res);
      });
    }); // it should not allow sender to accept connection request.

    it('should give an error when accepting a non-existent connection request', function test() {
      let token = null;
      return api.registerUserAsync(api.makeSampleUserOne()).then(function onFirstRegister(res) {
        statusHelper.ok(res);
        token = res.body.content.token;
        return api.acceptConnectionRequestAsync(token, 'nonsense');
      }).then(function onAccept(res) {
        statusHelper.badRequest(res);
        return api.acceptConnectionRequestAsync(token, '55da5c24bc4423e5754b7821');
      }).then(function onSecondAccept(res) {
        statusHelper.notFound(res);
      });
    }); // It should give an error when accepting a non-existent connection request.
  }); // End describe accepting.
});
