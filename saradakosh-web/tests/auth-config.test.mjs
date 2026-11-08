import test from 'node:test';
import assert from 'node:assert/strict';
import { authConfiguration } from '../src/lib/auth-config.mjs';

test('development sessions accept only the two assigned local origins', () => {
  assert.deepEqual(authConfiguration('development').authorizedParties,
    ['http://localhost:3100', 'http://localhost:3101']);
});

test('production sessions have an exact root-domain allowlist and canonical auth pages', () => {
  const config = authConfiguration('production');
  assert.deepEqual(config.authorizedParties,
    ['https://www.saradakosh.org', 'https://blog.saradakosh.org']);
  assert.equal(config.signInUrl, 'https://www.saradakosh.org/sign-in');
  assert.equal(config.signUpUrl, 'https://www.saradakosh.org/sign-up');
});

test('an absent or unknown environment cannot silently select trusted parties', () => {
  for (const value of ['', 'preview', 'http://attacker.example']) {
    assert.throws(() => authConfiguration(value), /AUTH_ENVIRONMENT/);
  }
});
