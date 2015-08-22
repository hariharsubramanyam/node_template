import 'source-map-support/register';
import {MongoClient} from 'mongodb';


const MONGO_TEST_URL = 'mongodb://localhost/urban_safe_test';

const USER_COLLECTION = 'users';
const USER_NAME = 'name';
const USER_ID = '_id';

const CONNECTION_COLLECTION = 'connections';

// Connect the database and trigger a callback (err, db).
function connectToDb(callback) {
  MongoClient.connect(MONGO_TEST_URL, callback);
}

// Search for the criteria on the given collection and trigger callback(err, docs).
function findCollectionByX(collection, criteria, callback) {
  connectToDb(function onConnect(err, db) {
    if (err) {
      callback(err);
    } else {
      db.collection(collection).find(criteria).toArray(function onResult(err2, data) {
        db.close();
        callback(err2, data);
      });
    }
  });
}

// Remove all documents from the collection and trigger callback(err, result).
function removeCollection(collection, callback) {
  connectToDb(function onConnect(err, db) {
    db.collection(collection).remove({}, function onResult(err2, data) {
      db.close();
      callback(err2, data);
    });
  });
}

// Given [[key1, value1], [key2, value2], ...]. Create an object from them (with keys and values).
function buildCriteria(keyVals) {
  const criteria = {};
  keyVals.forEach(a => criteria[a[0]] = a[1]);
  return criteria;
}

// Remove all the users.
export function removeUsers(callback) {
  removeCollection(USER_COLLECTION, callback);
}

export function removeConnections(callback) {
  removeCollection(CONNECTION_COLLECTION, callback);
}

export function removeDb(callback) {
  removeUsers(function onRemoveUsers(err) {
    if (err) {
      callback(err);
    } else {
      removeConnections(callback);
    }
  });
}

// Find all the users with given id.
export function findUsersById(id, callback) {
  findCollectionByX(USER_COLLECTION, buildCriteria([[USER_ID, id]]), callback);
}

// Find all the users with given name.
export function findUsersByName(name, callback) {
  findCollectionByX(USER_COLLECTION, buildCriteria([[USER_NAME, name]]), callback);
}
