import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formatCrmDate} from '../src/lib/dates.ts';
test('UTC receipt dates display on the correct Caracas day',()=> {
 assert.match(formatCrmDate('2026-10-29T00:15:00.000Z'),/28\/10\/2026/);
});
test('legacy UTC minute strings keep the same interpretation',()=> {
 assert.equal(formatCrmDate('2026-10-29 00:15'),formatCrmDate('2026-10-29T00:15:00.000Z'));
});
