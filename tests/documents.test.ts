import {test} from 'node:test';
import assert from 'node:assert/strict';
import {documentVersion,validateDocumentFile} from '../src/domain/documents.ts';
import type {ClientDocument} from '../src/types/index.ts';
const previous={id:'doc-1',caseId:'case-1',clientId:'client',version:1,kind:'client_upload',uploadedByUid:'client'} as ClientDocument;
test('document versions preserve the predecessor and enforce case and uploader boundaries',()=>{
 assert.deepEqual(documentVersion(undefined,'case-1','client','client',false),{version:1,previousVersionId:null});
 assert.deepEqual(documentVersion(previous,'case-1','client','client',false),{version:2,previousVersionId:'doc-1'});
 assert.equal(previous.version,1);
 assert.throws(()=>documentVersion(previous,'case-other','client','client',true));
 assert.throws(()=>documentVersion(previous,'case-1','client','other',false));
 assert.throws(()=>documentVersion({...previous,kind:'draft'},'case-1','client','client',false));
});
test('file validation excludes empty, oversized and executable uploads',()=>{
 assert.doesNotThrow(()=>validateDocumentFile({size:1200,type:'application/pdf'}));
 assert.throws(()=>validateDocumentFile({size:0,type:'application/pdf'}));
 assert.throws(()=>validateDocumentFile({size:25*1024*1024,type:'application/pdf'}));
 assert.throws(()=>validateDocumentFile({size:1200,type:'application/x-msdownload'}));
});
