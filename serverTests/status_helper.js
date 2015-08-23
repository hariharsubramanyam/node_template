import {expect} from 'chai';
import HttpStatus from 'http-status-codes';

export function ok(res) {
  expect(res.statusCode).to.eql(HttpStatus.OK);
  return res;
}

export function unauthorized(res) {
  expect(res.statusCode).to.eql(HttpStatus.UNAUTHORIZED);
  return res;
}

export function notFound(res) {
  expect(res.statusCode).to.eql(HttpStatus.NOT_FOUND);
  return res;
}

export function badRequest(res) {
  expect(res.statusCode).to.eql(HttpStatus.BAD_REQUEST);
  return res;
}

export function forbidden(res) {
  expect(res.statusCode).to.eql(HttpStatus.FORBIDDEN);
  return res;
}
