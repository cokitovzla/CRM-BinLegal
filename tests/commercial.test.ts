import {test} from 'node:test';
import assert from 'node:assert/strict';
import {commercialStatus,parseCaracasDateTime,caracasDateTimeInput,validateCommercial,validateBudgetDispatch} from '../src/domain/commercial.ts';
import type {Lead} from '../src/types/index.ts';
const lead:Lead={id:'request',fullName:'Ana',email:'ana@example.com',company:'Proyecto',industry:'Servicios',stage:'En crecimiento',areasOfInterest:[],status:'cliente_activo',createdAt:'2026-10-28',calculatedRiskScore:0,riskSummary:'',riskItems:[],internalNotes:[]};
test('changing an arbitrary label cannot complete commercial milestones',()=>{
 assert.equal(commercialStatus(lead),'nuevo_lead');
 assert.equal(commercialStatus({...lead,status:'sesion_programada'}),'nuevo_lead');
});
test('a diagnostic assessment is not evidence of a client contact or hired work',()=>{
 assert.equal(commercialStatus({...lead,followUp:{responsibleName:'Director',nextAction:'Llamar',nextActionDate:'2026-10-29',assessment:'Revisado',diagnosticStatus:'completed'}}),'nuevo_lead');
});
test('registered contact moves only commercial attention into follow-up',()=>{
 const value={...lead,commercial:{contact:{at:'2026-10-28T15:00:00Z',channel:'Correo' as const,note:'Cliente confirmó recepción'}}};
 assert.equal(commercialStatus(value),'diagnostico_enviado');
 assert.equal(value.acceptedBudget,undefined);
});
test('scheduling a meeting does not mean a meeting was held or services accepted',()=>{
 const value={...lead,commercial:{meeting:{at:'2026-10-29T16:00:00Z',modality:'Llamada' as const,status:'scheduled' as const,location:'',note:'Primera conversación'}}};
 assert.equal(commercialStatus(value),'sesion_programada');
 assert.equal(value.acceptedBudget,undefined);
});
test('a sent label without a dispatch reference does not establish proposal dispatch',()=>{
 const budget={items:[],currency:'USD' as const,status:'enviado' as const};
 assert.equal(commercialStatus({...lead,budget}),'nuevo_lead');
 assert.throws(()=>validateBudgetDispatch(budget));
 assert.equal(commercialStatus({...lead,budget:{...budget,sentEvidence:'Correo, propuesta 001'}}),'propuesta_presentada');
});
test('acceptance comes from actual accepted-service records, not proposal status',()=>{
 const value={...lead,acceptedBudget:{versionId:'v1',budget:{items:[],currency:'USD' as const,status:'enviado' as const},services:[{itemId:'a',caseId:'case-a',actorUid:'director',acceptedAt:'2026-10-28',evidence:'Correo'}]}};
 assert.equal(commercialStatus(value),'cliente_activo');
 assert.equal(value.commercial,undefined);
});
test('approval cannot be set through the budget status selector',()=>{
 assert.throws(()=>validateBudgetDispatch({items:[],currency:'USD',status:'aprobado'}));
});
test('commercial records need actual dates and reference notes',()=>{
 assert.throws(()=>validateCommercial({contact:{at:'bad',channel:'Correo',note:'Mensaje'}}));
 assert.throws(()=>validateCommercial({contact:{at:'2026-01-01T12:00:00Z',channel:'Correo',note:' '}}));
 assert.throws(()=>validateCommercial({contact:{at:'2099-01-01T12:00:00Z',channel:'Correo',note:'Futuro'}}));
 assert.throws(()=>validateCommercial({meeting:{at:'2099-01-01T12:00:00Z',modality:'Llamada',status:'completed',location:'',note:'No ocurrió aún'}}));
});
test('Caracas local date conversion is explicit and rejects impossible dates',()=>{
 assert.equal(parseCaracasDateTime('2026-10-28T14:30'),'2026-10-28T18:30:00.000Z');
 assert.equal(caracasDateTimeInput('2026-10-28T18:30:00Z'),'2026-10-28T14:30');
 assert.throws(()=>parseCaracasDateTime('2026-02-30T14:30'));
});
