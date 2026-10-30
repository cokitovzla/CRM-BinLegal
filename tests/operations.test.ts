import {test} from 'node:test';
import assert from 'node:assert/strict';
import {acceptServices,transitionTask,validateTask,validateCaseStart,validateCaseControls,validateTaskExecution,validateFinalReview,validateCaseClosure} from '../src/domain/operations.ts';
import type {Lead,WorkflowTask} from '../src/types/index.ts';
const actor={uid:'director',name:'Director',admin:true};
const lead:Lead={id:'request-1',fullName:'Ana',email:'ana@example.com',company:'Proyecto',industry:'Servicios',stage:'En crecimiento',areasOfInterest:['Corporativo'],status:'propuesta_presentada',createdAt:'2026-10-28',calculatedRiskScore:0,riskSummary:'',riskItems:[],internalNotes:[],budget:{currency:'USD',status:'enviado',items:[{id:'service-a',concept:'Registro',area:'Corporativo',quantity:1,unitPrice:100},{id:'service-b',concept:'Contrato',area:'Contratos',quantity:1,unitPrice:200},{id:'service-c',concept:'Marca',area:'Propiedad Intelectual',quantity:1,unitPrice:300}]}};
test('two accepted services open two independent cases, not all three',()=>{
 const result=acceptServices(lead,['service-a','service-b'],'Correo del cliente',actor,'2026-10-28T18:00:00Z');
 assert.equal(result.processes.length,2);
 assert.notEqual(result.processes[0].id,result.processes[1].id);
 assert.ok(result.processes.every(item=>item.leadId===lead.id&&item.caseStage==='not_started'));
 assert.ok(result.processes.every(item=>item.userId!==lead.id));
 assert.equal(lead.acceptedBudget,undefined);
});
test('repeated acceptance never opens the same service twice',()=>{
 const first=acceptServices(lead,['service-a'],'Correo',actor);
 const second=acceptServices({...lead,acceptedBudget:first.acceptance},['service-a'],'Reintento',actor);
 assert.equal(second.processes.length,0);assert.equal(second.acceptance.services.length,1);
});
test('later partial acceptance uses the preserved budget, not changed prices',()=>{
 const first=acceptServices(lead,['service-a'],'Correo',actor);
 const changed={...lead,budget:{...lead.budget!,items:[]},acceptedBudget:first.acceptance};
 const second=acceptServices(changed,['service-b'],'Segundo correo',actor);
 assert.equal(second.processes.length,1);assert.equal(second.acceptance.budget.items[1].unitPrice,200);
 assert.equal(second.acceptance.services.length,2);
});
test('draft, missing evidence, unauthorized actors and unknown services are rejected',()=>{
 assert.throws(()=>acceptServices({...lead,budget:{...lead.budget!,status:'borrador'}},['service-a'],'Correo',actor));
 assert.throws(()=>acceptServices(lead,['service-a'],' ',actor));
 assert.throws(()=>acceptServices(lead,['service-a'],'Correo',{...actor,admin:false}));
 assert.throws(()=>acceptServices(lead,['unknown'],'Correo',actor));
});
const task:WorkflowTask={id:'task-1',caseId:'case-1',clientId:'',title:'Preparar escrito',description:'Antecedentes',expectedResult:'Borrador revisable',status:'assigned',priority:'normal',assignedToUid:'intern',assignedToName:'Pasante',reviewerUid:'reviewer',reviewerName:'Supervisora',requiresReview:true,requiresJoseApproval:true,assignedByUid:'director',assignedByName:'Director',createdByUid:'director',createdAt:'2026-10-28',updatedAt:'2026-10-28',reassignmentStatus:'not_required',visibility:'internal'};
test('budget validity includes the final Caracas day and prevents new expired acceptances',()=>{
 const dated={...lead,budget:{...lead.budget!,validUntil:'2026-10-29'}};
 const first=acceptServices(dated,['service-a'],'Correo',actor,'2026-10-30T03:59:59.999Z');
 assert.equal(first.processes.length,1);
 assert.throws(()=>acceptServices(dated,['service-b'],'Correo',actor,'2026-10-30T04:00:00Z'),/vencido/);
 const accepted={...dated,acceptedBudget:first.acceptance};
 assert.equal(acceptServices(accepted,['service-a'],'Reintento',actor,'2026-11-01T12:00:00Z').processes.length,0);
 assert.throws(()=>acceptServices(accepted,['service-b'],'Correo',actor,'2026-11-01T12:00:00Z'),/vencido/);
 assert.equal(first.acceptance.services.length,1);
 assert.throws(()=>acceptServices({...dated,budget:{...dated.budget,validUntil:'2026-02-30'}},['service-a'],'Correo',actor),/no es válida/);
});
const worker={uid:'intern',name:'Pasante',admin:false};const reviewer={uid:'reviewer',name:'Supervisora',admin:false};
test('task requires result, responsible and configured reviewer',()=>{
 assert.doesNotThrow(()=>validateTask(task));
 assert.throws(()=>validateTask({...task,expectedResult:''}));
 assert.throws(()=>validateTask({...task,assignedToUid:null}));
 assert.throws(()=>validateTask({...task,reviewerUid:null}));
});
test('execution goes through review and cannot complete directly',()=>{
 const started=transitionTask(task,'in_progress',worker);
 assert.throws(()=>transitionTask(started,'completed',worker));
 const sent=transitionTask(started,'pending_approval',worker);
 assert.throws(()=>transitionTask(sent,'completed',worker));
 assert.equal(transitionTask(sent,'completed',reviewer).status,'completed');
 assert.equal(sent.caseId,'case-1');
});
test('corrections require notes and can return to review after rework',()=>{
 const sent={...task,status:'pending_approval' as const};
 assert.throws(()=>transitionTask(sent,'changes_requested',reviewer,' '));
 const correction=transitionTask(sent,'changes_requested',reviewer,'Falta identificar a las partes');
 assert.equal(correction.reviewNote,'Falta identificar a las partes');
 const rework=transitionTask(correction,'in_progress',worker);
 assert.equal(transitionTask(rework,'pending_approval',worker).status,'pending_approval');
});
test('a person outside the assignment cannot move work',()=>{
 assert.throws(()=>transitionTask(task,'in_progress',{uid:'outsider',name:'Otro',admin:false}));
});
test('reopening requires a reason and removes the completion timestamp',()=>{
 const completed={...task,status:'completed' as const,completedAt:'2026-10-28'};
 assert.throws(()=>transitionTask(completed,'in_progress',actor));
 const reopened=transitionTask(completed,'in_progress',actor,'Nueva observación');
 assert.equal(reopened.completedAt,null);assert.equal(reopened.revision,1);
});
test('individual work without required review can close directly',()=>{
 const started={...task,status:'in_progress' as const,requiresReview:false,reviewerUid:null};
 assert.equal(transitionTask(started,'completed',worker).status,'completed');
});

test('case start requires declared conditions and evidence or explicit authorized exception',()=>{
 const process=acceptServices(lead,['service-a'],'Correo',actor).processes[0];
 assert.throws(()=>validateCaseStart(process,actor));
 const configured={...process,startAuthorization:{requirements:'Recaudos mínimos y anticipo acordado',evidence:'',exceptionReason:''}};
 assert.throws(()=>validateCaseStart(configured,actor));
 assert.throws(()=>validateCaseStart({...configured,startAuthorization:{...configured.startAuthorization,evidence:'Recibo y documentos'}},{...actor,admin:false}));
 assert.equal(validateCaseStart({...configured,startAuthorization:{...configured.startAuthorization,evidence:'Recibo y documentos'}},actor).actorUid,actor.uid);
 assert.equal(validateCaseStart({...configured,startAuthorization:{...configured.startAuthorization,exceptionReason:'Urgencia autorizada; anticipo pendiente'}},actor).exceptionReason,'Urgencia autorizada; anticipo pendiente');
 assert.throws(()=>validateCaseStart({...configured,caseStage:'completed'},actor));
});

test('individual pending requirements block start without an authorized exception',()=>{
 const process=acceptServices(lead,['service-a'],'Correo',actor).processes[0];
 const caseControls={requirements:[{id:'document',title:'Documento de identidad',responsible:'Cliente',evidence:''}],hold:{state:'none' as const,reason:'',dependsOn:'',nextAction:''}};
 const configured={...process,caseControls,startAuthorization:{requirements:'Recaudos',evidence:'Referencia general',exceptionReason:''}};
 assert.throws(()=>validateCaseStart(configured,actor));
 assert.doesNotThrow(()=>validateCaseStart({...configured,startAuthorization:{...configured.startAuthorization,exceptionReason:'Inicio urgente autorizado'}},actor));
 assert.throws(()=>validateCaseStart({...configured,caseControls:{...caseControls,hold:{state:'blocked',reason:'Falta respuesta',dependsOn:'Cliente',nextAction:'Solicitar recaudo'}},startAuthorization:{...configured.startAuthorization,exceptionReason:'Urgente'}},actor));
});
test('holds require actionable context and requirements need responsible people',()=>{
 const value={requirements:[],hold:{state:'waiting' as const,reason:'Falta recaudo',dependsOn:'Cliente',nextAction:'Solicitar documento'}};
 assert.doesNotThrow(()=>validateCaseControls(value));
 assert.throws(()=>validateCaseControls({...value,hold:{...value.hold,nextAction:''}}));
 assert.throws(()=>validateCaseControls({...value,requirements:[{id:'x',title:'Documento',responsible:'',evidence:''}]}));
});

test('suspension freezes execution and review but allows reasoned cancellation',()=>{
 const process={caseStage:'in_progress' as const,caseControls:{requirements:[],hold:{state:'suspended' as const,reason:'Pausa',dependsOn:'Director',nextAction:'Revisar suspensión'}}};
 for(const next of ['in_progress','pending_approval','completed','changes_requested'] as const) assert.throws(()=>validateTaskExecution(process,next));
 assert.doesNotThrow(()=>validateTaskExecution(process,'cancelled'));
 assert.throws(()=>validateTaskExecution({caseStage:'completed'},'in_progress'));
 assert.doesNotThrow(()=>validateTaskExecution({...process,caseControls:{...process.caseControls,hold:{...process.caseControls.hold,state:'none'}}},'in_progress'));
});
test('a planned task cannot start before the service is authorized',()=>{
 assert.throws(()=>validateTaskExecution({caseStage:'not_started'},'in_progress'),/Autoriza el inicio/);
 assert.doesNotThrow(()=>validateTaskExecution({caseStage:'not_started'},'cancelled'));
 assert.doesNotThrow(()=>validateTaskExecution({caseStage:'in_progress'},'in_progress'));
});
test('final review rejects open work, all-cancelled work and pending conditions',()=>{
 const process={...acceptServices(lead,['service-a'],'Correo',actor).processes[0],caseStage:'in_progress' as const};
 assert.throws(()=>validateFinalReview(process,[],actor));
 assert.throws(()=>validateFinalReview(process,[task],actor));
 assert.throws(()=>validateFinalReview(process,[{...task,status:'cancelled'}],actor));
 assert.doesNotThrow(()=>validateFinalReview(process,[{...task,status:'completed'}],actor));
 assert.throws(()=>validateFinalReview({...process,caseControls:{requirements:[{id:'x',title:'Documento',responsible:'Cliente',evidence:''}],hold:{state:'none',reason:'',dependsOn:'',nextAction:''}}},[{...task,status:'completed'}],actor));
});
test('closure rejects mock files, wrong client, unpublished delivery and missing final review',()=>{
 const process={...acceptServices(lead,['service-a'],'Correo',actor).processes[0],caseStage:'final_review' as const,userId:'client'};
 const delivery={id:'doc',caseId:process.id,clientId:'client',name:'Entrega.pdf',kind:'final_deliverable' as const,status:'delivered' as const,visibleToClient:true,publishedAt:'2026-10-28',publishedByUid:actor.uid,storagePath:'client-documents/'+process.id+'/director/Entrega.pdf',contentType:'application/pdf',sizeBytes:100,version:1,category:'Final',uploadedAt:'2026-10-28',uploadedByUid:actor.uid,uploadedByName:actor.name};
 const tasks=[{...task,status:'completed' as const}];
 assert.doesNotThrow(()=>validateCaseClosure(process,tasks,delivery,'Entrega verificada',actor));
 assert.throws(()=>validateCaseClosure(process,tasks,{...delivery,storagePath:'demo://sample'},'Entrega',actor));
 assert.throws(()=>validateCaseClosure(process,tasks,{...delivery,clientId:'otro'},'Entrega',actor));
 assert.throws(()=>validateCaseClosure(process,tasks,{...delivery,visibleToClient:false},'Entrega',actor));
 assert.throws(()=>validateCaseClosure({...process,caseStage:'in_progress'},tasks,delivery,'Entrega',actor));
 assert.throws(()=>validateCaseClosure(process,tasks,delivery,'',actor));
});
