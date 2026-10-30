import test from 'node:test';
import assert from 'node:assert/strict';
import {PROVISIONAL_CATALOG} from '../src/data/provisionalCatalog.ts';

test('the provisional catalog offers three editable examples for each legal area', () => {
  const areas = ['Corporativo','Propiedad Intelectual','Regulatorio','Laboral','Contratos','Mediación','Negociación y mediación','Asesoría General'];
  assert.equal(PROVISIONAL_CATALOG.length, 24);
  for (const area of areas) assert.equal(PROVISIONAL_CATALOG.filter(item => item.area === area).length, 3);
  assert.equal(new Set(PROVISIONAL_CATALOG.map(item => item.id)).size, PROVISIONAL_CATALOG.length);
  assert.ok(PROVISIONAL_CATALOG.every(item => item.suggestedPrice > 0 && item.concept.trim()));
});
