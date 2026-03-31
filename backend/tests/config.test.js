import test from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../src/config.js';

test('config exposes default port', () => {
  assert.equal(typeof config.port, 'number');
  assert.ok(config.port > 0);
});
