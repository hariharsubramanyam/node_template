// API endpoints for managing connections.

import 'source-map-support/register';
import HttpStatus from 'http-status-codes';
import passport from '../config/passport';
import User from '../models/user';
import Connection from '../models/connection';
import Promise from 'bluebird';
import express from 'express';
import {sendSuccessResponse, sendFailureResponse} from './route_utils';
import {checkBody} from './route_utils';


Promise.promisifyAll(User);
Promise.promisifyAll(Connection);
const checkBodyAsync = Promise.promisify(checkBody);

// This causes a lint error because only constructors are allowed to have positive letters.
/*eslint-disable*/
const router = express.Router();
/*eslint-enable*/

function isConnectionBetween(idA, idB) {
  const aSendBRec = {
    '$and': [
      {'sender': idA},
      {'recipient': idB},
    ],
  };
  const bSendARec = {
    '$and': [
      {'sender': idB},
      {'recipient': idA},
    ],
  };
  const connectionExists = {
    '$or': [
      aSendBRec,
      bSendARec,
    ],
  };

  return Connection.findOneAsync(connectionExists);
}

// Get all the connections for the given user.
router.get('/connections',
    passport.authenticate('bearer', {'session': false}),
    function getConnections(req, res) {
      const filterCondition = {
        '$or': [
          {'sender': req.user._id},
          {'recipient': req.user._id},
        ],
      };
      const connectionPromise = Connection.findAsync(filterCondition);
      const arrayPromise = connectionPromise.then(function onFoundConnections(connections) {
        const others = connections.map(function pickOther(connection) {
          if (connection.sender.equals(req.user._id)) {
            return connection.recipient;
          }
          return connection.sender;
        });
        // TODO(hsubrama): If the number of connections is large, this could be a problem. Fixing
        // this would either require:
        // 1. Redesiging the schema so that the user's connections are within the same document.
        // 2. Limiting the number of connections that a user can have.
        //
        // Option 2 is preferable because option 1 requires much more work and also requires
        // multi-document edits (add A to B's connection list, add B to A's connection list),
        // which cannot be done atomically.
        return User.findAsync({'_id': {
          '$in': others,
        }});
      });

      Promise.join(connectionPromise, arrayPromise, function bothPromises(connections, users) {
        const userForId = new Map();
        users.forEach(function addToMap(user) {
          userForId.set(user._id.toString(), user);
        });

        const returnedConnections = connections.map(function makeReturnValue(connection) {
          let sender;
          let recipient;
          if (connection.sender.equals(req.user._id)) {
            recipient = userForId.get(connection.recipient.toString()).email;
            sender = req.user.email;
          } else {
            sender = userForId.get(connection.sender.toString()).email;
            recipient = req.user.email;
          }
          return {
            sender,
            recipient,
            'accepted': connection.accepted,
          };
        });
        sendSuccessResponse(res, 'Connections and connection requests', returnedConnections);
      }).catch(function onError(err) {
        sendFailureResponse(res, err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, err);
      });
    });

// Send a connection request to a given user.
router.post('/connections',
    passport.authenticate('bearer', {'session': false}),
    function makeConnection(req, res) {
      const userPromise = checkBodyAsync(['email'], req, res).then(function onValid() {
        if (req.user.email === req.body.email) {
          const err = new Error('You cannot send a connection request to yourself');
          err.statusCode = HttpStatus.BAD_REQUEST;
          return Promise.reject(err);
        }
        return User.findOneAsync({'email': req.body.email});
      });

      const connectionPromise = userPromise.then(function onFoundUser(user) {
        if (!user) {
          const err = new Error('Cannot send connection request because recipient does not exist');
          err.statusCode = HttpStatus.NOT_FOUND;
          return Promise.reject(err);
        }
        return isConnectionBetween(user._id, req.user._id);
      });

      Promise.join(userPromise, connectionPromise, function onPromises(user, connection) {
        if (connection) {
          const err = new Error('There is already a connection or connection request');
          err.statusCode = HttpStatus.FORBIDDEN;
          return Promise.reject(err);
        }
        const connectionRequest = new Connection();
        connectionRequest.sender = req.user._id;
        connectionRequest.recipient = user._id;
        connectionRequest.accepted = false;
        Promise.promisifyAll(connectionRequest);
        return connectionRequest.saveAsync();
      }).then(function onSave(connections) {
        if (connections.length !== 2 || connections[1] !== 1) {
          return Promise.reject(new Error('Could not save connection'));
        }
        sendSuccessResponse(res, 'Created connection request', {
          'sender': req.user.email,
          'recipient': req.body.email,
        });
      }).catch(function onError(err) {
        sendFailureResponse(res, err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, err);
      });
    });

export default router;
