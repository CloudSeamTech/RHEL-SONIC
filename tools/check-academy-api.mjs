import assert from 'node:assert/strict';
const base = process.env.ACADEMY_TEST_URL || 'http://127.0.0.1:3011';
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname))
  throw new Error('Run these test identities only against a local preview.');
const user = 'qa-alice-' + Date.now(),
  other = 'qa-bob-' + Date.now();
async function get(id) {
  const response = await fetch(base + '/api/learner', {
    headers: id
      ? {
          'oai-authenticated-user-id': id,
          'oai-authenticated-user-full-name': 'Test Learner',
        }
      : {},
  });
  assert.match(response.headers.get('cache-control'), /no-store/);
  return response.json();
}
async function post(id, body, origin = base) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(base + '/api/learner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
        ...(id ? { 'oai-authenticated-user-id': id } : {}),
      },
      body: JSON.stringify({ accountId: id, ...body }),
    });
    if (response.status !== 503) return response;
    const reason = await response.text();
    if (!reason.includes('worker restarted mid-request') || attempt === 3)
      throw new Error('Local preview unavailable: ' + reason);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('Local preview kept restarting.');
}

assert.equal((await get()).user, null);
assert.equal((await post(null, { name: 'Unauthorized' })).status, 401);
assert.equal(
  (await post(user, { name: 'Alice' }, 'https://other.example')).status,
  403,
);
assert.equal(
  (await post(user, { accountId: other, name: 'Wrong account' })).status,
  409,
);
assert.equal(
  (await post(user, { records: { 'unapproved-key': '[]' } })).status,
  400,
);
assert.equal(
  (await post(user, { records: { 'sonic-alma-desktop-v1': 'broken' } })).status,
  400,
);
assert.equal((await post(user, { lessonId: 'not-a-lesson' })).status, 400);
const record = JSON.stringify({ version: 1, completed: ['lab-00'] });
assert.equal(
  (
    await post(user, {
      name: 'Alice Learning',
      email: 'alice@example.test',
      phone: '+1 (555) 010-0200',
      records: { 'sonic-agency-azure-migration-v1': record },
      lessonId: 'lab-00',
    })
  ).status,
  200,
);
const saved = await get(user);
assert.equal(saved.user.name, 'Alice Learning');
assert.equal(saved.user.email, 'alice@example.test');
assert.equal(saved.user.phone, '+1 (555) 010-0200');
assert.equal(saved.user.subscriptionTier, 'free');
assert.equal((await post(user, { subscriptionTier: 'apex' })).status, 400);
assert.equal((await post(user, { email: 'invalid email' })).status, 400);
assert.equal((await post(user, { phone: '<script>' })).status, 400);
assert.equal((await get(user)).user.subscriptionTier, 'free');
assert.equal(saved.records['sonic-agency-azure-migration-v1'], record);
assert.equal(saved.activity[0].lesson_id, 'lab-00');
assert.deepEqual((await get(other)).records, {});
assert.deepEqual((await get(other)).activity, []);
assert.equal(
  (
    await post(other, {
      name: 'Bob Learning',
      records: { 'sonic-alma-desktop-v1': '["alma-plan"]' },
    })
  ).status,
  200,
);
assert.equal((await get(user)).records['sonic-alma-desktop-v1'], undefined);
assert.equal((await get(other)).user.name, 'Bob Learning');
console.log(
  'PASS: real local D1 persistence, profile update, activity, separate users, anonymous writes blocked, CSRF and invalid records rejected',
);
