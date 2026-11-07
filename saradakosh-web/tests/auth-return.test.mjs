import test from 'node:test';
import assert from 'node:assert/strict';
import { authReturnTo } from '../src/lib/auth-return.mjs';
const main = 'http://localhost:3100';
const blog = 'http://localhost:3101';

test('canonical authentication permits exactly the configured Blog root handoff', () => {
  assert.equal(authReturnTo(`${blog}/`, main, blog), `${blog}/`);
  assert.equal(authReturnTo('/classes/Subject%20One?chapter=2', main, blog), `${main}/classes/Subject%20One?chapter=2`);
});

test('Blog API paths, queries, lookalikes and external origins cannot become auth returns', () => {
  for (const candidate of [`${blog}/api/manage/articles/visibility`, `${blog}/?next=https://attacker.invalid`,
    `${blog}/#fragment`, 'http://localhost:3101.attacker.invalid/', 'https://attacker.invalid/',
    'http://user@localhost:3101/', '//localhost:3101/', `${blog}/manage/articles`]) {
    assert.equal(authReturnTo(candidate, main, blog), `${main}/classes`);
  }
});
