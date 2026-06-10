const test = require('node:test');
const assert = require('node:assert/strict');

const { getPortCandidates } = require('../utils/serverConfig');

test('getPortCandidates returns the requested port first and fallbacks after it', () => {
  assert.deepEqual(getPortCandidates(8080), [8080, 8081, 8082, 8083]);
});
