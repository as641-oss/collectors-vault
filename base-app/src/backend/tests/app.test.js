import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('app factory creates an express app function', () => {
  const app = createApp();
  assert.equal(typeof app, 'function');
});
