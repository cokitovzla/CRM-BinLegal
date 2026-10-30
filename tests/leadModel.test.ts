import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanLead, publicIntake, clientRecords, validateFollowUp } from '../src/services/leadModel.ts';
import type { Lead } from '../src/types/index.ts';

const lead: Lead = {
  id: 'request-01', fullName: '  Ana Pérez  ', email: ' ANA@EXAMPLE.COM ', company: ' Proyecto Uno ',
  industry: 'Servicios', stage: 'Idea / Pre-lanzamiento', areasOfInterest: ['Corporativo'],
  notes: undefined, phone: undefined, status: 'nuevo_lead', createdAt: '2026-10-28T16:00:00.000Z',
  calculatedRiskScore: 0, riskSummary: '', riskItems: [], internalNotes: [],
};

test('optional blank fields can be persisted and input is not mutated', () => {
  const saved = cleanLead(lead, 'manual');
  assert.equal(saved.fullName, 'Ana Pérez'); assert.equal(saved.email, 'ana@example.com');
  assert.equal(saved.officeId, 'binlegal'); assert.ok(!('phone' in saved));
  assert.equal(lead.fullName, '  Ana Pérez  ');
});
test('public submissions cannot inject internal authority or professional assessments', () => {
  const saved = publicIntake({ ...lead, officeId: 'another-office', status: 'cliente_activo',
    assignedLawyer: 'Someone', personId: 'existing-person', companyId: 'existing-company',
    revision: 99, internalNotes: [{id:'1',author:'Director',text:'Approved',timestamp:'today'}],
    followUp: {responsibleName:'Director',nextAction:'Approve',nextActionDate:'2026-10-28',assessment:'Approved',diagnosticStatus:'completed'},
  }, 'contact');
  assert.equal(saved.officeId, 'binlegal'); assert.equal(saved.status, 'nuevo_lead');
  for (const key of ['followUp','assignedLawyer','personId','companyId','revision']) assert.ok(!(key in saved));
  assert.deepEqual(saved.internalNotes, []);
});
test('retrying the same public payload keeps one identity and payload', () => {
  assert.deepEqual(publicIntake(lead, 'diagnostic'), publicIntake(lead, 'diagnostic'));
  assert.equal(publicIntake(lead, 'contact').id, lead.id);
});
test('a contact is separate from an access account; names do not merge identities', () => {
  const first = clientRecords(cleanLead(lead, 'manual'));
  const second = clientRecords(cleanLead({...lead,id:'request-02'}, 'manual'));
  assert.equal(first.person.accountUid, null);
  assert.notEqual(first.person.id, second.person.id);
  assert.deepEqual(first.person.companyIds, [first.company!.id]);
});
test('particular clients do not create a fictitious company', () => {
  const records = clientRecords({...lead,company:'Consulta particular'});
  assert.equal(records.company, null); assert.deepEqual(records.person.companyIds, []);
});
test('invalid contact data is rejected before a write', () => {
  assert.throws(() => cleanLead({...lead,email:'invalid'},'manual'));
  assert.throws(() => cleanLead({...lead,fullName:'  '},'manual'));
});
const followUp = {responsibleName:' José ',nextAction:' Llamar ',nextActionDate:'2026-10-29',assessment:'',diagnosticStatus:'pending' as const};
test('completed diagnoses require a professional assessment', () => {
  assert.throws(() => validateFollowUp({...followUp,diagnosticStatus:'completed'}));
  assert.equal(validateFollowUp({...followUp,diagnosticStatus:'completed',assessment:' Revisado '}).assessment,'Revisado');
});
test('follow-up requires a responsible person, action and real calendar date', () => {
  assert.throws(() => validateFollowUp({...followUp,responsibleName:' '}));
  assert.throws(() => validateFollowUp({...followUp,nextActionDate:'2026-02-30'}));
  assert.throws(() => validateFollowUp({...followUp,nextAction:''}));
  assert.equal(validateFollowUp(followUp).responsibleName,'José');
});
