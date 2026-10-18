import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertLoopbackBinding,
  isAllowedOrigin,
  isLoopbackAddress,
  matchesToken,
  validPort,
} from '../src/security.mjs';

test('accepts only loopback addresses and browser origins', () => {
  assert.equal(isLoopbackAddress('127.0.0.1'), true);
  assert.equal(isLoopbackAddress('::ffff:127.0.0.1'), true);
  assert.equal(isLoopbackAddress('192.168.1.10'), false);
  assert.equal(isAllowedOrigin('http://localhost:3000'), true);
  assert.equal(isAllowedOrigin('http://127.0.0.1:3000'), true);
  assert.equal(isAllowedOrigin('https://sonic.example.com'), false);
  assert.throws(() => assertLoopbackBinding('0.0.0.0'), /loopback/);
});

test('token comparison rejects short and incorrect credentials', () => {
  const token = 'a'.repeat(43);
  assert.equal(matchesToken(token, token), true);
  assert.equal(matchesToken('wrong', token), false);
  assert.equal(matchesToken('a'.repeat(42) + 'b', token), false);
});

test('port is bounded to a non-privileged valid range', () => {
  assert.equal(validPort('43127'), 43127);
  assert.equal(validPort('80'), 43127);
  assert.equal(validPort('not-a-port'), 43127);
});
