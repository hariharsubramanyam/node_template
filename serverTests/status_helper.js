import {expect} from 'chai';
import HttpStatus from 'http-status-codes';

function ok(res) {
  expect(res.statusCode).to.eql(HttpStatus.OK);
  return res;
}

function unauthorized(res) {
  expect(res.statusCode).to.eql(HttpStatus.UNAUTHORIZED);
  return res;
}

function notFound(res) {
  expect(res.statusCode).to.eql(HttpStatus.NOT_FOUND);
  return res;
}

function badRequest(res) {
  expect(res.statusCode).to.eql(HttpStatus.BAD_REQUEST);
  return res;
}

function forbidden(res) {
  expect(res.statusCode).to.eql(HttpStatus.FORBIDDEN);
  return res;
}

export default {
  ok,
  unauthorized,
  notFound,
  badRequest,
  forbidden,
};
