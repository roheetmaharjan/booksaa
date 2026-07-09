import test from 'node:test';
import assert from 'node:assert/strict';
import { slugifyText } from '../../lib/utils.js';

test('slugifyText converts business names to dashed slugs', () => {
  assert.equal(slugifyText('Rohit Parlour and Saloon'), 'rohit-parlour-and-saloon');
  assert.equal(slugifyText('  My   Business  Name  '), 'my-business-name');
  assert.equal(slugifyText('Café & Co. Ltd'), 'cafe-co-ltd');
});
