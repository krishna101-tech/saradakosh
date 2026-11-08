// Isolated DAL tests; no real Clerk account/session is used or impersonated.
// Run: node --experimental-test-module-mocks --test tests/classes-session.test.mjs
import { test, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

// Next's bundler resolves extensionless framework imports; native Node needs
// that same resolution before applying the isolated navigation stub.
registerHooks({ resolve: (specifier, context, next) => next(specifier === 'next/navigation' ? 'next/navigation.js' : specifier, context) });

const identity = { userId: 'user_member', sessionId: 'sess_member' };
const active = { id: 'sess_member', userId: 'user_member', status: 'active' };
let currentIdentity;
let currentSession;
let backendFailure;
let backendCalls;
let reads;
const protect = mock.fn(async () => currentIdentity);
mock.module('server-only', { namedExports: {} });
mock.module('@clerk/nextjs/server', { namedExports: {
  auth: { protect },
  clerkClient: async () => ({ sessions: { getSession: async id => {
    backendCalls.push(id);
    if (backendFailure) throw new Error('Backend unavailable');
    return currentSession;
  } } }),
} });
mock.module('next/navigation.js', { namedExports: { notFound: () => { throw new Error('NOT_FOUND'); } } });
mock.module('node:fs/promises', { namedExports: { readFile: async () => {
  reads++;
  return JSON.stringify({ records: [{ videoId: 'testVideo01', title: 'Private fixture' }] });
} } });
const { getClassRecords, getClassRecord, getClassTranscript } = await import('../src/lib/classes-data.mjs');

beforeEach(() => {
  currentIdentity = identity;
  currentSession = active;
  backendFailure = false;
  backendCalls = [];
  reads = 0;
});

test('matching active session admits a registered user and reads only after Backend validation', async () => {
  assert.equal((await getClassRecords()).length, 1);
  assert.deepEqual(backendCalls, ['sess_member']);
  assert.equal(reads, 1);
});

for (const status of ['revoked', 'ended', 'expired', 'pending', 'unknown']) {
  test(`${status} session denies catalog, detail and transcript before private reads`, async () => {
    currentSession = { ...active, status };
    for (const read of [getClassRecords, () => getClassRecord('testVideo01'), () => getClassTranscript('testVideo01')]) {
      await assert.rejects(read, /NOT_FOUND/);
    }
    assert.equal(reads, 0);
  });
}

test('mismatched user or session ID fails closed', async () => {
  for (const value of [{ ...active, userId: 'user_other' }, { ...active, id: 'sess_other' }]) {
    currentSession = value;
    await assert.rejects(getClassRecords, /NOT_FOUND/);
  }
  assert.equal(reads, 0);
});

test('incomplete identity denies without calling Backend', async () => {
  for (const value of [{ userId: null, sessionId: null }, { userId: 'user_member', sessionId: null }]) {
    currentIdentity = value;
    await assert.rejects(getClassRecords, /NOT_FOUND/);
  }
  assert.equal(backendCalls.length, 0);
  assert.equal(reads, 0);
});

test('Backend outage or missing session fails closed before private reads', async () => {
  backendFailure = true;
  await assert.rejects(getClassRecords, /NOT_FOUND/);
  backendFailure = false;
  currentSession = null;
  await assert.rejects(getClassRecords, /NOT_FOUND/);
  assert.equal(reads, 0);
});

test('later call with the same JWT identity rechecks revocation rather than reusing active state', async () => {
  await getClassRecords();
  currentSession = { ...active, status: 'revoked' };
  await assert.rejects(getClassRecords, /NOT_FOUND/);
  assert.equal(backendCalls.length, 2);
  assert.equal(reads, 1);
});
