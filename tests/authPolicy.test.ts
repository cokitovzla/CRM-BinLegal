import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isVerifiedAdminEmail} from '../src/lib/authPolicy.ts';
test('privileged emails require verification',()=> {
  assert.equal(isVerifiedAdminEmail('contacto@binlegal.com',false),false);
  assert.equal(isVerifiedAdminEmail('contacto@binlegal.com',true),true);
});
test('an email containing the office domain does not grant authority',()=> {
  assert.equal(isVerifiedAdminEmail('visitor@fakebinlegal.com',true),false);
  assert.equal(isVerifiedAdminEmail('binlegal.com@attacker.example',true),false);
  assert.equal(isVerifiedAdminEmail(null,true),false);
});
