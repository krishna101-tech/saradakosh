import test from 'node:test';
import assert from 'node:assert/strict';
import { classesReturnTo } from '../src/lib/classes-return.mjs';

const origin = 'http://localhost:3100';

test('Classes deep links and search state remain on the configured main origin', () => {
  for (const candidate of ['/classes', '/classes/Subject%20One?chapter=2', `${origin}/classes/transcripts/abcdefghijk`]) {
    assert.equal(classesReturnTo(candidate, origin), new URL(candidate, origin).href);
  }
});

test('untrusted redirect origins, credentials, path escapes and malformed targets fall back safely', () => {
  const rejected = [undefined, [], '', 'https://attacker.invalid/classes', '//attacker.invalid/classes',
    'http://localhost:3101/classes', 'http://user@localhost:3100/classes', '/classes/../about',
    '/classes/%2e%2e/about', '/classes/%5cattacker', '/classes/%00', '/classes/%ff',
    '/classes#https://attacker.invalid', '/classes\nLocation:https://attacker.invalid',
    '/classes\\attacker', '/classes-other', 'javascript:alert(1)'];
  for (const candidate of rejected) {
    assert.equal(classesReturnTo(candidate, origin), `${origin}/classes`);
  }
});
