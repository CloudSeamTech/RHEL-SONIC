import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newMaintenancePractice,
  practiseMaintenance,
  canPractiseUpdate,
} from '../lib/maintenance-rehearsal.ts';
const protect = (state, id) =>
  ['baseline', 'backup', 'snapshot'].reduce(
    (s, a) => practiseMaintenance(s, id, a),
    state,
  );
const pass = (state, id) =>
  ['update', 'reboot', 'pass'].reduce(
    (s, a) => practiseMaintenance(s, id, a),
    protect(state, id),
  );
test('a wave stays locked until both protected pilots pass, and only one server changes at a time', () => {
  let state = newMaintenancePractice();
  assert.equal(canPractiseUpdate(state, 'win-pilot'), false);
  state = protect(state, 'win-wave');
  assert.equal(canPractiseUpdate(state, 'win-wave'), false);
  state = pass(state, 'win-pilot');
  assert.equal(canPractiseUpdate(state, 'win-wave'), false);
  state = protect(state, 'rhel-pilot');
  state = practiseMaintenance(state, 'rhel-pilot', 'update');
  assert.equal(canPractiseUpdate(state, 'win-wave'), false);
  state = practiseMaintenance(state, 'rhel-pilot', 'reboot');
  assert.equal(canPractiseUpdate(state, 'win-wave'), false);
  state = practiseMaintenance(state, 'rhel-pilot', 'pass');
  assert.equal(canPractiseUpdate(state, 'win-wave'), true);
  state = practiseMaintenance(state, 'win-wave', 'update');
  assert.equal(
    canPractiseUpdate(protect(state, 'rhel-wave'), 'rhel-wave'),
    false,
  );
});
test('failed health checks stop rollout; restoring a pilot does not certify the patch', () => {
  let state = protect(newMaintenancePractice(), 'win-pilot');
  for (const action of ['update', 'reboot', 'fail'])
    state = practiseMaintenance(state, 'win-pilot', action);
  assert.equal(
    canPractiseUpdate(protect(state, 'rhel-pilot'), 'rhel-pilot'),
    false,
  );
  state = practiseMaintenance(state, 'win-pilot', 'restore');
  assert.equal(state.servers[0].status, 'restored');
  assert.equal(
    canPractiseUpdate(protect(state, 'win-wave'), 'win-wave'),
    false,
  );
  assert.equal(canPractiseUpdate(state, 'win-pilot'), true);
  state = pass(state, 'win-pilot');
  assert.equal(state.servers[0].status, 'passed');
  assert.equal(practiseMaintenance(state, 'unknown', 'update'), state);
});
